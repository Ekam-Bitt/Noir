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
    id: string;
    name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default: boolean;
  }[]>`
    select id, name, line1, line2, city, state, postal_code, country, phone, is_default
    from customer_addresses
    where user_id = ${user.id}::uuid
    order by is_default desc, created_at desc
  `;

  return {
    name: profile?.full_name?.trim() || String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Customer"),
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? String(user.user_metadata?.phone ?? "").trim(),
    addresses: addresses.map((address) => ({
      id: address.id,
      name: address.name,
      line1: address.line1,
      line2: address.line2 ?? undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone ?? "",
      isDefault: address.is_default,
    })),
  };
}

type CustomerAddressInput = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

function normalizeAddress(input: CustomerAddressInput) {
  return {
    name: input.name.trim(),
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    city: input.city.trim(),
    state: input.state.trim(),
    postalCode: input.postalCode.trim(),
    country: input.country.trim(),
    phone: input.phone.trim(),
    isDefault: Boolean(input.isDefault),
  };
}

export async function createCustomerAddressForUser(userId: string, input: CustomerAddressInput) {
  const sql = getSql();
  const address = normalizeAddress(input);

  await sql`
    update customer_profiles
    set
      full_name = ${address.name},
      phone = ${address.phone},
      updated_at = timezone('utc', now())
    where id = ${userId}::uuid
  `;

  if (address.isDefault) {
    await sql`
      update customer_addresses
      set is_default = false
      where user_id = ${userId}::uuid
    `;
  }

  const [created] = await sql<{ id: string }[]>`
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
      ${address.line2},
      ${address.city},
      ${address.state},
      ${address.postalCode},
      ${address.country},
      ${address.phone},
      ${address.isDefault}
    )
    returning id
  `;

  return created?.id;
}

export async function updateCustomerAddressForUser(userId: string, addressId: string, input: CustomerAddressInput) {
  const sql = getSql();
  const address = normalizeAddress(input);

  await sql`
    update customer_profiles
    set
      full_name = ${address.name},
      phone = ${address.phone},
      updated_at = timezone('utc', now())
    where id = ${userId}::uuid
  `;

  if (address.isDefault) {
    await sql`
      update customer_addresses
      set is_default = false
      where user_id = ${userId}::uuid
        and id <> ${addressId}::uuid
    `;
  }

  await sql`
    update customer_addresses
    set
      name = ${address.name},
      line1 = ${address.line1},
      line2 = ${address.line2},
      city = ${address.city},
      state = ${address.state},
      postal_code = ${address.postalCode},
      country = ${address.country},
      phone = ${address.phone},
      is_default = ${address.isDefault}
    where id = ${addressId}::uuid
      and user_id = ${userId}::uuid
  `;
}

export async function deleteCustomerAddressForUser(userId: string, addressId: string) {
  const sql = getSql();

  const [existing] = await sql<{ id: string; is_default: boolean }[]>`
    select id, is_default
    from customer_addresses
    where id = ${addressId}::uuid
      and user_id = ${userId}::uuid
    limit 1
  `;

  if (!existing) {
    throw new Error("Address not found.");
  }

  await sql`
    delete from customer_addresses
    where id = ${addressId}::uuid
      and user_id = ${userId}::uuid
  `;

  if (existing.is_default) {
    await sql`
      update customer_addresses
      set is_default = true
      where id = (
        select id
        from customer_addresses
        where user_id = ${userId}::uuid
        order by created_at desc
        limit 1
      )
    `;
  }
}

export async function setDefaultCustomerAddressForUser(userId: string, addressId: string) {
  const sql = getSql();

  await sql`
    update customer_addresses
    set is_default = false
    where user_id = ${userId}::uuid
  `;

  await sql`
    update customer_addresses
    set is_default = true
    where id = ${addressId}::uuid
      and user_id = ${userId}::uuid
  `;
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
    subtotal: number;
    discount_total: number;
    shipping_fee: number;
    tax_total: number;
    grand_total: number;
    payment_provider: string;
    payment_reference: string;
    shipping_method: string;
    customer_name: string | null;
    customer_phone: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    product_name: string;
    product_slug: string;
    unit_price: number;
    size: string;
    color: string;
    quantity: number;
    images: Array<{
      id: string;
      label: string;
      palette: [string, string, string];
      url?: string;
      path?: string;
      alt?: string;
    }> | null;
  }[]>`
    select
      o.id,
      o.order_number,
      o.created_at,
      o.payment_status,
      o.fulfillment_status,
      o.subtotal,
      o.discount_total,
      o.shipping_fee,
      o.tax_total,
      o.grand_total,
      o.payment_provider,
      o.payment_reference,
      o.shipping_method,
      co.customer_name,
      co.customer_phone,
      co.address_line1,
      co.address_line2,
      co.city,
      co.state,
      co.postal_code,
      co.country,
      i.product_name,
      i.product_slug,
      i.unit_price,
      i.size,
      i.color,
      i.quantity
      ,
      p.images
    from customer_orders o
    left join commerce_orders co on co.order_number = o.order_number
    left join customer_order_items i on i.order_id = o.id
    left join catalog_products p on p.slug = i.product_slug
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
          productSlug: row.product_slug,
          productImage: row.images?.[0],
          size: row.size,
          color: row.color,
          quantity: row.quantity,
          unitPrice: row.unit_price,
        });
      }
      return;
    }

    mapped.set(row.id, {
      id: row.id,
      orderNumber: row.order_number,
      createdAt: new Date(row.created_at).toISOString().slice(0, 10),
      expectedAt: new Date(new Date(row.created_at).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      paymentStatus: row.payment_status,
      fulfillmentStatus: row.fulfillment_status,
      subtotal: row.subtotal,
      discountTotal: row.discount_total,
      shippingFee: row.shipping_fee,
      taxTotal: row.tax_total,
      total: row.grand_total,
      paymentProvider: row.payment_provider,
      paymentReference: row.payment_reference,
      shippingMethod: row.shipping_method,
      contactName: row.customer_name ?? undefined,
      contactPhone: row.customer_phone ?? undefined,
      shippingAddress:
        row.address_line1 && row.city && row.state && row.postal_code && row.country
          ? {
              line1: row.address_line1,
              line2: row.address_line2 ?? undefined,
              city: row.city,
              state: row.state,
              postalCode: row.postal_code,
              country: row.country,
            }
          : undefined,
      items: row.product_name
        ? [
            {
              productName: row.product_name,
              productSlug: row.product_slug,
              productImage: row.images?.[0],
              size: row.size,
              color: row.color,
              quantity: row.quantity,
              unitPrice: row.unit_price,
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
    update customer_profiles
    set
      full_name = ${address.name},
      phone = ${address.phone},
      updated_at = timezone('utc', now())
    where id = ${userId}::uuid
  `;

  const normalized = {
    line1: address.line1.trim(),
    line2: address.line2?.trim() || null,
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.postalCode.trim(),
    country: address.country.trim(),
  };

  const [existing] = await sql<{ id: string }[]>`
    select id
    from customer_addresses
    where user_id = ${userId}::uuid
      and lower(line1) = lower(${normalized.line1})
      and coalesce(lower(line2), '') = coalesce(lower(${normalized.line2}), '')
      and lower(city) = lower(${normalized.city})
      and lower(state) = lower(${normalized.state})
      and postal_code = ${normalized.postalCode}
      and lower(country) = lower(${normalized.country})
    limit 1
  `;

  await sql`
    update customer_addresses
    set is_default = false
    where user_id = ${userId}::uuid
  `;

  if (existing) {
    await sql`
      update customer_addresses
      set
        name = ${address.name},
        phone = ${address.phone},
        is_default = true
      where id = ${existing.id}::uuid
    `;
    return;
  }

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
      ${normalized.line1},
      ${normalized.line2},
      ${normalized.city},
      ${normalized.state},
      ${normalized.postalCode},
      ${normalized.country},
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
