"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";
import { INDIA_STATE_CITIES, INDIA_STATES } from "@/lib/data/india";
import type { Cart, CheckoutSession, CustomerProfile } from "@/lib/types";
import { formatINR } from "@/lib/utils";

type CheckoutFormProps = {
  customer: CustomerProfile;
};

type SessionResponse = CheckoutSession & { cart: Cart };
type RazorpayCheckoutResponse = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  brandName: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

export function CheckoutForm({ customer }: CheckoutFormProps) {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isResolvingPincode, setResolvingPincode] = useState(false);
  const [form, setForm] = useState({
    email: customer.email,
    phone: customer.phone ? customer.phone.replace(/\D/g, "").slice(-10) : "",
    name: customer.name,
    line1: customer.addresses[0]?.line1 ?? "",
    line2: customer.addresses[0]?.line2 ?? "",
    city: customer.addresses[0]?.city ?? "",
    state: customer.addresses[0]?.state ?? "",
    postalCode: customer.addresses[0]?.postalCode ?? "",
    country: "India",
    shippingMethod: "standard",
    paymentMethod: "razorpay-test",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const baseCitiesForState: string[] = form.state
    ? [...(INDIA_STATE_CITIES[form.state as keyof typeof INDIA_STATE_CITIES] ?? [])]
    : [];
  const citiesForState =
    form.city && !baseCitiesForState.includes(form.city)
      ? [form.city, ...baseCitiesForState]
      : baseCitiesForState;

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/checkout/session", { cache: "no-store" });
        const data = (await response.json()) as { session?: SessionResponse; error?: string };
        if (!response.ok || !data.session) {
          throw new Error(data.error ?? "Unable to load checkout.");
        }
        const defaultPaymentMethod =
          data.session.paymentOptions?.[0]?.id ?? "razorpay-test";
        setSession(data.session);
        setForm((current) => ({ ...current, paymentMethod: defaultPaymentMethod }));
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to load checkout.");
      }
    }

    void loadSession();
  }, []);

  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!form.postalCode.match(/^[1-9][0-9]{5}$/)) {
      setResolvingPincode(false);
      return;
    }

    let ignore = false;

    async function resolvePincode() {
      setResolvingPincode(true);

      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${form.postalCode}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as Array<{
          Status?: string;
          PostOffice?: Array<{
            State?: string;
            District?: string;
            Name?: string;
          }>;
        }>;

        if (ignore) {
          return;
        }

        const postOffice = data[0]?.PostOffice?.[0];
        const state = postOffice?.State?.trim();
        const city = postOffice?.District?.trim() || postOffice?.Name?.trim();

        if (!response.ok || data[0]?.Status !== "Success" || !state || !city) {
          setFieldErrors((current) => ({
            ...current,
            postalCode: "PIN code not found.",
          }));
          return;
        }

        setForm((current) => ({
          ...current,
          state,
          city,
        }));
        setFieldErrors((current) => ({
          ...current,
          postalCode: undefined,
          state: undefined,
          city: undefined,
        }));
      } catch {
        if (ignore) {
          return;
        }

        setFieldErrors((current) => ({
          ...current,
          postalCode: "Unable to verify PIN code right now.",
        }));
      } finally {
        if (!ignore) {
          setResolvingPincode(false);
        }
      }
    }

    void resolvePincode();

    return () => {
      ignore = true;
    };
  }, [form.postalCode]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof typeof form, string>> = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(form.phone.replace(/\s+/g, ""))) {
      nextErrors.phone = "Enter a valid Indian mobile number.";
    }

    if (form.name.trim().length < 2) {
      nextErrors.name = "Enter the customer name.";
    }

    if (form.line1.trim().length < 3) {
      nextErrors.line1 = "Enter the street address.";
    }

    if (!/^[1-9][0-9]{5}$/.test(form.postalCode)) {
      nextErrors.postalCode = "Enter a valid 6-digit PIN code.";
    }

    if (!form.state) {
      nextErrors.state = "Select a state.";
    }

    if (!form.city) {
      nextErrors.city = "Select a city.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const payload = {
    ...form,
    phone: form.phone.replace(/\s+/g, ""),
    country: "India",
    shippingMethod: "standard",
    paymentMethod: "razorpay-test",
  };

  const orderSummary = session?.cart;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="space-y-6">
        {error ? (
          <div className="rounded-[1.5rem] border border-[#4a2f2a] bg-[#241613] p-4 text-sm text-[#e3b2a7]">
            {error}
          </div>
        ) : null}

        {[
          {
            key: "contact",
            title: "Contact",
            fields: [
              { name: "email", placeholder: "Email" },
              { name: "phone", placeholder: "Phone" },
            ],
          },
        ].map((section, index) => (
          <div key={section.key} className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Step {index + 1}</p>
            <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">{section.title}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <input
                    type={field.name === "email" ? "email" : field.name === "phone" ? "tel" : "text"}
                    inputMode={field.name === "phone" ? "tel" : undefined}
                    maxLength={field.name === "phone" ? 10 : undefined}
                    value={form[field.name as keyof typeof form]}
                    onChange={(event) => {
                      let nextValue = event.target.value;
                      if (field.name === "phone") {
                        nextValue = nextValue.replace(/\D/g, "").slice(0, 10);
                      }
                      updateField(field.name as keyof typeof form, nextValue);
                    }}
                    className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                    placeholder={field.placeholder}
                  />
                  {fieldErrors[field.name as keyof typeof form] ? (
                    <p className="px-1 text-xs text-[#dba89f]">{fieldErrors[field.name as keyof typeof form]}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Step 2</p>
          <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">Shipping address</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                placeholder="Full name"
              />
              {fieldErrors.name ? <p className="px-1 text-xs text-[#dba89f]">{fieldErrors.name}</p> : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <input
                value={form.line1}
                onChange={(event) => updateField("line1", event.target.value)}
                className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                placeholder="Address line 1"
              />
              {fieldErrors.line1 ? <p className="px-1 text-xs text-[#dba89f]">{fieldErrors.line1}</p> : null}
            </div>
            <input
              value={form.line2}
              onChange={(event) => updateField("line2", event.target.value)}
              className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none md:col-span-2"
              placeholder="Address line 2"
            />
            <div className="space-y-2">
              <input
                value={form.postalCode}
                maxLength={6}
                inputMode="numeric"
                onChange={(event) => updateField("postalCode", event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-full border border-[#312a26] bg-transparent px-4 py-3 text-sm outline-none"
                placeholder="PIN code"
              />
              {fieldErrors.postalCode ? <p className="px-1 text-xs text-[#dba89f]">{fieldErrors.postalCode}</p> : null}
              {!fieldErrors.postalCode && isResolvingPincode ? (
                <p className="px-1 text-xs text-[#9e9082]">Looking up city and state...</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <select
                value={form.state}
                onChange={(event) => {
                  const nextState = event.target.value;
                  updateField("state", nextState);
                  updateField("city", "");
                }}
                className="w-full rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none"
              >
                <option value="">Select state</option>
                {INDIA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {fieldErrors.state ? <p className="px-1 text-xs text-[#dba89f]">{fieldErrors.state}</p> : null}
            </div>
            <div className="space-y-2">
              <select
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                disabled={!form.state}
                className="w-full rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none disabled:opacity-60"
              >
                <option value="">{form.state ? "Select city" : "Select state first"}</option>
                {citiesForState.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {fieldErrors.city ? <p className="px-1 text-xs text-[#dba89f]">{fieldErrors.city}</p> : null}
            </div>
            <div className="space-y-2">
              <input
                value={form.country}
                readOnly
                className="w-full rounded-full border border-[#312a26] bg-[#171311] px-4 py-3 text-sm text-[#a99d92] outline-none"
                placeholder="Country"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Step 3</p>
          <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">Delivery & payment</h2>
          <div className="mt-5 space-y-3">
            {session?.shippingOptions[0] ? (
              <div className="rounded-[1.4rem] border border-[#2f2926] p-4">
                <span className="block text-sm text-[#f5efe8]">{session.shippingOptions[0].label} shipping</span>
                <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-[#8d7f73]">
                  {session.shippingOptions[0].eta}
                </span>
                <span className="mt-3 block text-sm text-[#c9bbb0]">
                  {session.shippingOptions[0].price === 0 ? "Free" : formatINR(session.shippingOptions[0].price)}
                </span>
              </div>
            ) : null}
            {session?.paymentOptions?.[0] ? (
              <div className="rounded-[1.4rem] border border-[#2f2926] p-4">
                <span className="block text-sm text-[#f5efe8]">{session.paymentOptions[0].label}</span>
                <span className="mt-1 block text-sm leading-7 text-[#9e9082]">
                  {session.paymentOptions[0].description}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6 lg:sticky lg:top-28 lg:h-fit">
        <h2 className="text-3xl tracking-[-0.04em] text-[#f5efe8]">Order summary</h2>
        {orderSummary ? (
          <>
            <div className="mt-6 space-y-3 text-sm text-[#c7b9ab]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(orderSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatINR(orderSummary.discountTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{orderSummary.shippingFee === 0 ? "Free" : formatINR(orderSummary.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatINR(orderSummary.taxTotal)}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-[#241f1d] pt-6 text-lg">
              <span>Estimated total</span>
              <span>{formatINR(orderSummary.grandTotal)}</span>
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-[#9e9082]">Loading summary...</p>
        )}

        <button
          type="button"
          disabled={isSubmitting || !session || !orderSummary?.lines.length}
          onClick={async () => {
            setSubmitting(true);
            setError(null);

            try {
              if (!validateForm()) {
                throw new Error("Please review the highlighted checkout fields.");
              }

              if (form.paymentMethod === "razorpay-test") {
                if (!window.Razorpay) {
                  throw new Error("Razorpay checkout is not available yet. Please retry in a moment.");
                }

                const response = await fetch("/api/checkout/session/razorpay", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });
                const data = (await response.json()) as {
                  checkout?: RazorpayCheckoutResponse;
                  error?: string;
                };
                if (!response.ok || !data.checkout) {
                  throw new Error(data.error ?? "Unable to start Razorpay checkout.");
                }

                const razorpay = new window.Razorpay({
                  key: data.checkout.keyId,
                  amount: data.checkout.amount,
                  currency: data.checkout.currency,
                  name: data.checkout.brandName,
                  description: data.checkout.description,
                  order_id: data.checkout.orderId,
                  prefill: data.checkout.prefill,
                  theme: {
                    color: "#1a1715",
                  },
                  modal: {
                    ondismiss: () => {
                      setSubmitting(false);
                    },
                  },
                  handler: async (paymentResponse: Record<string, string>) => {
                    try {
                      const verifyResponse = await fetch("/api/checkout/session/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          razorpayOrderId: paymentResponse.razorpay_order_id,
                          razorpayPaymentId: paymentResponse.razorpay_payment_id,
                          razorpaySignature: paymentResponse.razorpay_signature,
                        }),
                      });
                      const verifyData = (await verifyResponse.json()) as {
                        order?: { orderNumber: string };
                        error?: string;
                      };
                      if (!verifyResponse.ok || !verifyData.order) {
                        throw new Error(verifyData.error ?? "Unable to verify payment.");
                      }
                      await refreshCart();
                      router.push(`/checkout/success/${verifyData.order.orderNumber}`);
                    } catch (nextError) {
                      setError(
                        nextError instanceof Error
                          ? nextError.message
                          : "Unable to verify payment.",
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  },
                });

                razorpay.on("payment.failed", (failure: unknown) => {
                  const message =
                    typeof failure === "object" &&
                    failure !== null &&
                    "error" in failure &&
                    typeof (failure as { error?: { description?: string } }).error?.description === "string"
                      ? (failure as { error?: { description?: string } }).error?.description
                      : "Payment failed.";
                  setError(message ?? "Payment failed.");
                  setSubmitting(false);
                });

                razorpay.open();
                return;
              }

              const response = await fetch("/api/checkout/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = (await response.json()) as { order?: { orderNumber: string }; error?: string };
              if (!response.ok || !data.order) {
                throw new Error(data.error ?? "Unable to place order.");
              }
              await refreshCart();
              router.push(`/checkout/success/${data.order.orderNumber}`);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : "Unable to place order.");
            } finally {
              if (form.paymentMethod !== "razorpay-test") {
                setSubmitting(false);
              }
            }
          }}
          className="mt-6 w-full rounded-full bg-[#f1ddc7] px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#1a1715] disabled:cursor-not-allowed disabled:bg-[#6c6157]"
        >
          {isSubmitting ? "Placing order..." : "Place order"}
        </button>
      </aside>
    </div>
  );
}
