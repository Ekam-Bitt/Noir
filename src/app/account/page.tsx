import { signOutAction } from "@/app/auth/actions";
import { AccountOrderHistory } from "@/components/account/account-order-history";
import Link from "next/link";
import { requireAuthenticatedViewer } from "@/lib/auth/server";
import { getCustomerProfileForUser, getOrderHistoryForUser, syncCustomerProfile } from "@/lib/services/customer-account";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const viewer = await requireAuthenticatedViewer("/account");
  await syncCustomerProfile(viewer.user);
  const [profile, orders] = await Promise.all([
    getCustomerProfileForUser(viewer.user),
    getOrderHistoryForUser(viewer.user),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Account</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Your account</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
          <h2 className="text-3xl tracking-[-0.04em] text-[#f5efe8]">{profile.name}</h2>
          <p className="mt-3 text-[#c7b9ab]">{profile.email}</p>
          <p className="text-[#c7b9ab]">{profile.phone}</p>
          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-[#312b27] px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#f5efe8]"
            >
              Sign out
            </button>
          </form>
          <div className="mt-6 border-t border-[#26211f] pt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Saved address</p>
              <Link href="/account/addresses" className="text-xs uppercase tracking-[0.18em] text-[#c7b9ab] transition hover:text-[#f5efe8]">
                Manage
              </Link>
            </div>
            {profile.addresses.length ? (
              profile.addresses.map((address, index) => (
                <div
                  key={address.id ?? `${address.line1}-${address.postalCode}-${index}`}
                  className="mt-3 text-sm leading-7 text-[#c7b9ab]"
                >
                  <p>{address.name}</p>
                  <p>{address.line1}</p>
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country}</p>
                </div>
              ))
            ) : (
              <p className="mt-3 text-sm leading-7 text-[#9e9082]">
                Your checkout address will appear here after your first purchase.
              </p>
            )}
          </div>
        </aside>
        <AccountOrderHistory orders={orders} />
      </div>
    </div>
  );
}
