import type { User } from "@supabase/supabase-js";

import { getSql } from "@/lib/server/postgres";
import type { CustomerProfile, OrderSummary, ProductCard } from "@/lib/types";

type WishlistProductRow = {
  id: string;
  slug: string;
  name: string;
  category: ProductCard["category"];
  subcategory: ProductCard["subcategory"];
  collection_name: string;
  price: number;
  compare_at_price: number | null;
  accent: ProductCard["accent"];
  tags: string[];
  sold_out: boolean;
};

export async function syncCustomerProfile(user: User) {
  const sql = getSql();
  if (!sql) {
    return;
  }

  await sql`
    insert into customer_profiles (
      id,
      email,
      full_name,
      phone,
      role
    ) values (
      ${user.id}::uuid,
      ${user.email ?? ""},
      ${String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "").trim()},
      ${String(user.user_metadata?.phone ?? "").trim()},
      ${user.app_metadata?.role === "admin" ? "admin" : "customer"}
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = case when excluded.full_name <> '' then excluded.full_name else customer_profiles.full_name end,
      phone = case when excluded.phone <> '' then excluded.phone else customer_profiles.phone end,
      role = excluded.role,
      updated_at = timezone('utc', now())
  `;
}

export async function getCustomerProfileForUser(user: User): Promise<CustomerProfile> {
  const sql = getSql();

  if (!sql) {
    return {
      name: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Customer").trim() || "Customer",
      email: user.email ?? "",
      phone: String(user.user_metadata?.phone ?? "").trim(),
      addresses: [],
    };
  }

  await syncCustomerProfile(user);

  const [profile] = await sql<{
    full_name: string | null;
    email: string | null;
    phone: string | null;
  }[]>`
    select full_name, email, phone
    from customer_profiles
    where id = ${user.id}::uuid
    limit 1
  `;

  const addresses = await sql<{
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
  }[]>`
    select name, line1, line2, city, state, postal_code, country, phone
    from customer_addresses
    where user_id = ${user.id}::uuid
    order by is_default desc, created_at desc
  `;

  return {
    name: profile?.full_name?.trim() || String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Customer"),
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? String(user.user_metadata?.phone ?? "").trim(),
    addresses: addresses.map((address) => ({
      name: address.name,
      line1: address.line1,
      line2: address.line2 ?? undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone ?? "",
    })),
  };
}

export async function getOrderHistoryForUser(user: User): Promise<OrderSummary[]> {
  const sql = getSql();
  if (!sql) {
    return [];
  }

  const rows = await sql<{
    id: string;
    order_number: string;
    created_at: string;
    payment_status: OrderSummary["paymentStatus"];
    fulfillment_status: OrderSummary["fulfillmentStatus"];
    grand_total: number;
    product_name: string;
    size: string;
    quantity: number;
  }[]>`
    select
      o.id,
      o.order_number,
      o.created_at,
      o.payment_status,
      o.fulfillment_status,
      o.grand_total,
      i.product_name,
      i.size,
      i.quantity
    from customer_orders o
    left join customer_order_items i on i.order_id = o.id
    where o.user_id = ${user.id}::uuid
    order by o.created_at desc, i.created_at asc
  `;

  const mapped = new Map<string, OrderSummary>();

  rows.forEach((row) => {
    const existing = mapped.get(row.id);
    if (existing) {
      if (row.product_name) {
        existing.items.push({
          productName: row.product_name,
          size: row.size,
          quantity: row.quantity,
        });
      }
      return;
    }

    mapped.set(row.id, {
      id: row.id,
      orderNumber: row.order_number,
      createdAt: row.created_at.slice(0, 10),
      paymentStatus: row.payment_status,
      fulfillmentStatus: row.fulfillment_status,
      total: row.grand_total,
      items: row.product_name
        ? [
            {
              productName: row.product_name,
              size: row.size,
              quantity: row.quantity,
            },
          ]
        : [],
    });
  });

  return [...mapped.values()];
}

export async function getWishlistProductsForUser(user: User): Promise<ProductCard[]> {
  const sql = getSql();
  const rows = await sql<WishlistProductRow[]>`
    select
      p.id,
      p.slug,
      p.name,
      p.category,
      p.subcategory,
      p.collection_name,
      p.price,
      p.compare_at_price,
      p.accent,
      p.tags,
      coalesce(bool_and(v.stock < 1), false) as sold_out
    from wishlist_items w
    join catalog_products p on p.id = w.product_id
    left join catalog_variants v on v.product_id = p.id
    where w.user_id = ${user.id}::uuid
    group by p.id
    order by max(w.created_at) desc
  `;

  return rows.map(
    (row): ProductCard => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      subcategory: row.subcategory,
      collection: row.collection_name,
      price: row.price,
      compareAtPrice: row.compare_at_price ?? undefined,
      accent: row.accent,
      soldOut: row.sold_out,
      tags: row.tags,
    }),
  );
}

export async function toggleWishlistProductForUser(user: User, productId: string) {
  const sql = getSql();
  if (!sql) {
    throw new Error("Postgres is not configured.");
  }

  const existing = await sql<{ product_id: string }[]>`
    select product_id
    from wishlist_items
    where user_id = ${user.id}::uuid and product_id = ${productId}
    limit 1
  `;

  if (existing.length) {
    await sql`
      delete from wishlist_items
      where user_id = ${user.id}::uuid and product_id = ${productId}
    `;
  } else {
    await sql`
      insert into wishlist_items (user_id, product_id)
      values (${user.id}::uuid, ${productId})
      on conflict do nothing
    `;
  }

  return getWishlistProductsForUser(user);
}

export async function upsertCustomerAddressForUser(
  userId: string,
  address: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  },
) {
  const sql = getSql();

  await sql`
    update customer_addresses
    set is_default = false
    where user_id = ${userId}::uuid
  `;

  await sql`
    insert into customer_addresses (
      user_id,
      name,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default
    ) values (
      ${userId}::uuid,
      ${address.name},
      ${address.line1},
      ${address.line2 ?? null},
      ${address.city},
      ${address.state},
      ${address.postalCode},
      ${address.country},
      ${address.phone},
      true
    )
  `;
}

export async function mirrorOrderForUser(params: {
  userId: string;
  order: {
    id: string;
    orderNumber: string;
    paymentStatus: "paid" | "pending" | "failed" | "refunded";
    fulfillmentStatus: "processing" | "shipped" | "delivered" | "returned";
    paymentProvider: string;
    paymentReference: string;
    shippingMethod: string;
    subtotal: number;
    discountTotal: number;
    shippingFee: number;
    taxTotal: number;
    grandTotal: number;
    createdAt: string;
    items: Array<{
      productName: string;
      productSlug: string;
      variantId: string;
      size: string;
      color: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
}) {
  const sql = getSql();
  if (!sql) {
    return;
  }

  const [createdOrder] = await sql<{ id: string }[]>`
    insert into customer_orders (
      user_id,
      order_number,
      payment_status,
      fulfillment_status,
      payment_provider,
      payment_reference,
      shipping_method,
      subtotal,
      discount_total,
      shipping_fee,
      tax_total,
      grand_total,
      created_at
    ) values (
      ${params.userId}::uuid,
      ${params.order.orderNumber},
      ${params.order.paymentStatus},
      ${params.order.fulfillmentStatus},
      ${params.order.paymentProvider},
      ${params.order.paymentReference},
      ${params.order.shippingMethod},
      ${params.order.subtotal},
      ${params.order.discountTotal},
      ${params.order.shippingFee},
      ${params.order.taxTotal},
      ${params.order.grandTotal},
      ${params.order.createdAt}
    )
    on conflict (order_number) do update set
      payment_status = excluded.payment_status,
      fulfillment_status = excluded.fulfillment_status,
      payment_reference = excluded.payment_reference,
      shipping_method = excluded.shipping_method,
      subtotal = excluded.subtotal,
      discount_total = excluded.discount_total,
      shipping_fee = excluded.shipping_fee,
      tax_total = excluded.tax_total,
      grand_total = excluded.grand_total
    returning id
  `;

  if (!createdOrder) {
    return;
  }

  await sql`
    delete from customer_order_items
    where order_id = ${createdOrder.id}::uuid
  `;

  for (const item of params.order.items) {
    await sql`
      insert into customer_order_items (
        order_id,
        product_name,
        product_slug,
        variant_id,
        size,
        color,
        quantity,
        unit_price
      ) values (
        ${createdOrder.id}::uuid,
        ${item.productName},
        ${item.productSlug},
        ${item.variantId},
        ${item.size},
        ${item.color},
        ${item.quantity},
        ${item.unitPrice}
      )
    `;
  }
}
