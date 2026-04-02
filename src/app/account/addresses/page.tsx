import Link from "next/link";

import { AddressBook } from "@/components/account/address-book";
import { requireAuthenticatedViewer } from "@/lib/auth/server";
import { getCustomerProfileForUser, syncCustomerProfile } from "@/lib/services/customer-account";

export const dynamic = "force-dynamic";

export default async function AccountAddressesPage() {
  const viewer = await requireAuthenticatedViewer("/account/addresses");
  await syncCustomerProfile(viewer.user);
  const profile = await getCustomerProfileForUser(viewer.user);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#9e9082]">
          <Link href="/account" className="transition hover:text-[#f5efe8]">
            Account
          </Link>
          <span>/</span>
          <span>Addresses</span>
        </div>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">Manage addresses</h1>
        <div className="mt-4">
          <Link href="/account" className="text-sm text-[#c7b9ab] transition hover:text-[#f5efe8]">
            Back to account
          </Link>
        </div>
      </div>

      <AddressBook initialAddresses={profile.addresses} />
    </div>
  );
}
