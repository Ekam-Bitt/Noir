"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  fulfillmentStatus: "processing" | "shipped" | "delivered" | "returned";
  grandTotal: number;
  name: string;
  email: string;
  items: Array<{
    id: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
  }>;
};

export function OrderAdminCard({ order }: { order: AdminOrder }) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <article className="rounded-[2rem] border border-[#26211f] bg-[#120f0d] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#9e9082]">{order.createdAt.slice(0, 10)}</p>
          <h3 className="mt-2 text-3xl tracking-[-0.04em] text-[#f5efe8]">{order.orderNumber}</h3>
          <p className="mt-2 text-sm text-[#c7b9ab]">{order.name} / {order.email}</p>
        </div>
        <p className="text-lg text-[#f5efe8]">Rs. {order.grandTotal}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <select
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value as typeof paymentStatus)}
          className="rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none"
        >
          <option value="paid">paid</option>
          <option value="pending">pending</option>
          <option value="failed">failed</option>
          <option value="refunded">refunded</option>
        </select>
        <select
          value={fulfillmentStatus}
          onChange={(event) => setFulfillmentStatus(event.target.value as typeof fulfillmentStatus)}
          className="rounded-full border border-[#312a26] bg-[#120f0d] px-4 py-3 text-sm outline-none"
        >
          <option value="processing">processing</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
          <option value="returned">returned</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {order.items.map((item) => (
          <span
            key={item.id}
            className="rounded-full border border-[#312b27] px-3 py-2 text-sm text-[#c7b9ab]"
          >
            {item.productName} / {item.color} / {item.size} / Qty {item.quantity}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={async () => {
            setMessage(null);
            const response = await fetch(`/api/admin/orders/${order.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentStatus, fulfillmentStatus }),
            });
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
              setMessage(data.error ?? "Unable to update order.");
              return;
            }
            setMessage("Order updated.");
            router.refresh();
          }}
          className="rounded-full bg-[#f1ddc7] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#1a1715]"
        >
          Save status
        </button>
        {message ? <p className="text-sm text-[#c7b9ab]">{message}</p> : null}
      </div>
    </article>
  );
}
