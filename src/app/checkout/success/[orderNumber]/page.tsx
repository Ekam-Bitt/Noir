import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderByNumber } from "@/lib/services/commerce";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
      <div className="rounded-[2.4rem] border border-[#26211f] bg-[#120f0d] p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[#9e9082]">Order confirmed</p>
        <h1 className="mt-4 text-6xl tracking-[-0.05em] text-[#f5efe8]">{order.orderNumber}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#c7b9ab]">
          Inventory was decremented, the cart was cleared, and a confirmation email log entry was created. Payment status is currently <span className="text-[#f5efe8]">{order.paymentStatus}</span>.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-[#26211f] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Shipping to</p>
            <p className="mt-3 leading-8 text-[#f5efe8]">
              {order.name}
              <br />
              {order.addressLine1}
              {order.addressLine2 ? (
                <>
                  <br />
                  {order.addressLine2}
                </>
              ) : null}
              <br />
              {order.city}, {order.state} {order.postalCode}
              <br />
              {order.country}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-[#26211f] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Receipt</p>
            <p className="mt-3 text-sm leading-8 text-[#c7b9ab]">
              Payment ref: {order.paymentReference}
              <br />
              Shipping method: {order.shippingMethod}
              <br />
              Grand total: {formatINR(order.grandTotal)}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-[#26211f] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Items</p>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-[#f5efe8]">
                <span>
                  {item.productName} / {item.color} / {item.size} / Qty {item.quantity}
                </span>
                <span>{formatINR(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-[#26211f] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">Email log</p>
          {order.emails.map((email) => (
            <div key={email.id} className="mt-4 text-sm leading-8 text-[#c7b9ab]">
              <p>To: {email.recipient}</p>
              <p>Subject: {email.subject}</p>
              <p>{email.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/account"
            className="rounded-full bg-[#f1ddc7] px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.24em] text-[#1a1715]"
          >
            View account
          </Link>
          <Link
            href="/products"
            className="rounded-full border border-[#312a26] px-6 py-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-[#f5efe8]"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
