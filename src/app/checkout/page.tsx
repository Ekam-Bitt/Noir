import { CheckoutForm } from "@/components/cart/checkout-form";
import { requireAuthenticatedViewer } from "@/lib/auth/server";
import { getCustomerProfileForUser, syncCustomerProfile } from "@/lib/services/customer-account";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const viewer = await requireAuthenticatedViewer("/checkout");
  await syncCustomerProfile(viewer.user);
  const customer = await getCustomerProfileForUser(viewer.user);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#9e9082]">
          <Link href="/cart" className="transition hover:text-[#f5efe8]">
            Cart
          </Link>
          <span>/</span>
          <a href="#checkout-contact" className="text-[#f5efe8]">
            Checkout
          </a>
          <span>/</span>
          <a href="#checkout-payment" className="transition hover:text-[#f5efe8]">
            Payment
          </a>
        </div>
      </div>
      <CheckoutForm customer={customer} />
    </div>
  );
}
