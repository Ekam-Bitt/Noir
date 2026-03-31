import Link from "next/link";

export function AdminNav() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/admin"
        className="rounded-full border border-[#312a26] px-4 py-2 text-sm text-[#f5efe8]"
      >
        Overview
      </Link>
      <Link
        href="/admin/products"
        className="rounded-full border border-[#312a26] px-4 py-2 text-sm text-[#f5efe8]"
      >
        Products
      </Link>
      <Link
        href="/admin/orders"
        className="rounded-full border border-[#312a26] px-4 py-2 text-sm text-[#f5efe8]"
      >
        Orders
      </Link>
      <Link
        href="/admin/drops"
        className="rounded-full border border-[#312a26] px-4 py-2 text-sm text-[#f5efe8]"
      >
        Drops
      </Link>
      <Link
        href="/admin/settings"
        className="rounded-full border border-[#312a26] px-4 py-2 text-sm text-[#f5efe8]"
      >
        Settings
      </Link>
    </div>
  );
}
