import Image from "next/image";
import Link from "next/link";

import type { OrderSummary } from "@/lib/types";
import { formatINR } from "@/lib/utils";

export function AccountOrderHistory({ orders }: { orders: OrderSummary[] }) {
  if (!orders.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-[#2f2926] px-6 py-16 text-center">
        <p className="text-3xl tracking-[-0.04em] text-[#f5efe8]">No orders yet.</p>
        <p className="mt-3 text-[#a7988b]">Completed purchases will appear here once checkout is connected to your account.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {orders.map((order) => (
        <details
          key={order.id}
          className="group rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6 transition open:border-[#3b332f]"
        >
          <summary className="cursor-pointer list-none">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#9e9082]">{order.createdAt}</p>
                <h2 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">{order.orderNumber}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#312b27] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f1ddc7]">
                    {order.paymentStatus}
                  </span>
                  <span className="rounded-full border border-[#312b27] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#c7b9ab]">
                    {order.fulfillmentStatus}
                  </span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-[#9e9082]">Order total</p>
                <p className="mt-1 text-lg text-[#f5efe8]">{formatINR(order.total)}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#9e9082] group-open:text-[#f1ddc7]">
                  View details
                </p>
              </div>
            </div>
          </summary>

          <div className="mt-6 border-t border-[#26211f] pt-6">
            <div className="grid gap-4 xl:grid-cols-3 xl:grid-rows-2">
              <div className="space-y-4 xl:col-start-3 xl:row-span-2">
                {order.items.map((item, index) => (
                  <Link
                    key={`${order.id}-${item.productSlug}-${item.size}-${item.color}-${index}`}
                    href={`/products/${item.productSlug}`}
                    className="flex gap-4 rounded-[1.6rem] border border-[#2d2623] p-4 transition hover:border-[#4a3f39]"
                  >
                    <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[1.2rem] bg-[#171311]">
                      {item.productImage?.url ? (
                        <Image
                          src={item.productImage.url}
                          alt={item.productImage.alt ?? item.productName}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{
                            backgroundImage: `radial-gradient(circle at top left, ${item.productImage?.palette?.[2] ?? "#d8c3b3"}, transparent 35%), linear-gradient(135deg, ${item.productImage?.palette?.[0] ?? "#161313"}, ${item.productImage?.palette?.[1] ?? "#6b5649"})`,
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg text-[#f5efe8]">{item.productName}</p>
                      <p className="mt-2 text-sm leading-7 text-[#b9ab9d]">
                        {item.color} / {item.size} / Qty {item.quantity}
                      </p>
                      {item.unitPrice ? (
                        <p className="mt-2 text-sm text-[#f1ddc7]">{formatINR(item.unitPrice * item.quantity)}</p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="rounded-[1.6rem] border border-[#2d2623] p-5 text-sm text-[#c7b9ab] xl:col-span-2 xl:row-start-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[#9e9082]">Order detail</p>
                <div className="mt-4 space-y-3">
                  {typeof order.subtotal === "number" ? (
                    <div className="flex justify-between gap-4">
                      <span>Subtotal</span>
                      <span>{formatINR(order.subtotal)}</span>
                    </div>
                  ) : null}
                  {typeof order.discountTotal === "number" ? (
                    <div className="flex justify-between gap-4">
                      <span>Discount</span>
                      <span>-{formatINR(order.discountTotal)}</span>
                    </div>
                  ) : null}
                  {typeof order.shippingFee === "number" ? (
                    <div className="flex justify-between gap-4">
                      <span>Shipping</span>
                      <span>{order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}</span>
                    </div>
                  ) : null}
                  {typeof order.taxTotal === "number" ? (
                    <div className="flex justify-between gap-4">
                      <span>Tax</span>
                      <span>{formatINR(order.taxTotal)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4 border-t border-[#26211f] pt-3">
                    <span className="text-[#f5efe8]">Total</span>
                    <span className="text-[#f5efe8]">{formatINR(order.total)}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-xs uppercase tracking-[0.18em] text-[#9e9082]">
                  {order.shippingMethod ? <p>Shipping: {order.shippingMethod}</p> : null}
                  {order.paymentProvider ? <p>Payment: {order.paymentProvider}</p> : null}
                  {order.paymentReference ? <p className="break-all">Ref: {order.paymentReference}</p> : null}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#2d2623] p-5 text-sm text-[#c7b9ab] xl:col-span-2 xl:row-start-2">
                <p className="text-xs uppercase tracking-[0.22em] text-[#9e9082]">Delivery snapshot</p>
                <div className="mt-4 grid gap-5 leading-7 md:grid-cols-2">
                  {order.contactName ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#9e9082]">Name</p>
                      <p className="text-[#f5efe8]">{order.contactName}</p>
                    </div>
                  ) : null}
                  {order.contactPhone ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#9e9082]">Phone</p>
                      <p>{order.contactPhone}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#9e9082]">Placed on</p>
                    <p>{order.createdAt}</p>
                  </div>
                  {order.expectedAt ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#9e9082]">Expected by</p>
                      <p>{order.expectedAt}</p>
                    </div>
                  ) : null}
                  {order.shippingAddress ? (
                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#9e9082]">Address used</p>
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </details>
      ))}
    </section>
  );
}
