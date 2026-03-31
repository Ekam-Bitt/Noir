import { CheckoutForm } from "@/components/cart/checkout-form";
import { getAuthViewer } from "@/lib/auth/server";
import { getCustomerProfile } from "@/lib/services/commerce";
import { getCustomerProfileForUser, syncCustomerProfile } from "@/lib/services/customer-account";
import type { CustomerProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const viewer = await getAuthViewer();
  let customer: CustomerProfile;

  if (viewer.user) {
    await syncCustomerProfile(viewer.user);
    customer = await getCustomerProfileForUser(viewer.user);
  } else {
    customer = await getCustomerProfile();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Checkout</p>
      </div>
      <CheckoutForm customer={customer} />
    </div>
  );
}
