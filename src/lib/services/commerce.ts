import { createHmac } from "node:crypto";

import { products as seededProducts } from "@/lib/data/store";
import { getStoreSettings } from "@/lib/services/content";
import { mirrorOrderForUser, upsertCustomerAddressForUser } from "@/lib/services/customer-account";
import { getSql } from "@/lib/server/postgres";
import type {
  Cart,
  CartLine,
  CheckoutSession,
  CustomerProfile,
  OrderSummary,
  ProductCard,
  ProductDetail,
  StoreSettings,
} from "@/lib/types";

type ProductQuery = {
  category?: string;
  subcategory?: string;
  color?: string;
  size?: string;
  tag?: string;
  sort?: string;
};

type CheckoutPayload = {
  email: string;
  phone: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod: string;
  paymentMethod: string;
};

const PROMO_CODE = "NOIR10";
const DEFAULT_ACCENT: [string, string, string] = ["#161313", "#6b5649", "#d8c3b3"];
let commerceSeedPromise: Promise<void> | null = null;

type SqlProductRow = {
  id: string;
  slug: string;
  name: string;
  category: ProductDetail["category"];
  subcategory: ProductDetail["subcategory"];
  collection_name: string;
  price: number;
  compare_at_price: number | null;
  accent: [string, string, string];
  tags: string[];
  description: string;
  fit: ProductDetail["fit"];
  fabric: string;
  care: string[];
  story: string;
  model_info: string;
  shipping_note: string;
  images: ProductDetail["images"];
  sizes: string[];
  colors: string[];
};

type SqlVariantRow = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
};

type CommerceOrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_phone: string;
  customer_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  payment_status: "paid" | "pending" | "failed" | "refunded";
  fulfillment_status: "processing" | "shipped" | "delivered" | "returned";
  payment_provider: string;
  payment_reference: string;
  shipping_method: string;
  subtotal: number;
  discount_total: number;
  shipping_fee: number;
  tax_total: number;
  grand_total: number;
  created_at: string;
};

type CommerceOrderItemRow = {
  id: string;
  product_name: string;
  product_slug: string;
  variant_id: string;
  size: string;
  color: string;
  quantity: number;
  unit_price: number;
};

type CommerceOrderEmailRow = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  created_at: string;
};

type AdminOrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  payment_status: OrderSummary["paymentStatus"];
  fulfillment_status: OrderSummary["fulfillmentStatus"];
  grand_total: number;
  customer_name: string;
  customer_email: string;
  item_id: string | null;
  product_name: string | null;
  size: string | null;
  color: string | null;
  quantity: number | null;
};

async function ensureCommerceSeeded() {
  const sql = getSql();
  if (!sql) {
    return;
  }

  if (!commerceSeedPromise) {
    commerceSeedPromise = (async () => {
      const [existing] = await sql<{ count: number }[]>`
        select count(*)::int as count
        from catalog_products
      `;

      if ((existing?.count ?? 0) > 0) {
        return;
      }

      for (const product of seededProducts) {
        await sql`
          insert into catalog_products (
            id,
            slug,
            name,
            category,
            subcategory,
            collection_name,
            price,
            compare_at_price,
            accent,
            tags,
            description,
            fit,
            fabric,
            care,
            story,
            model_info,
            shipping_note,
            images,
            sizes,
            colors
          ) values (
            ${product.id},
            ${product.slug},
            ${product.name},
            ${product.category},
            ${product.subcategory},
            ${product.collection},
            ${product.price},
            ${product.compareAtPrice ?? null},
            ${sql.json(product.accent)},
            ${sql.json(product.tags)},
            ${product.description},
            ${product.fit},
            ${product.fabric},
            ${sql.json(product.care)},
            ${product.story},
            ${product.modelInfo},
            ${product.shippingNote},
            ${sql.json(product.images)},
            ${sql.json(product.sizes)},
            ${sql.json(product.colors)}
          )
          on conflict (id) do nothing
        `;

        for (const variant of product.variants) {
          await sql`
            insert into catalog_variants (
              id,
              product_id,
              size,
              color,
              stock,
              sku
            ) values (
              ${variant.id},
              ${product.id},
              ${variant.size},
              ${variant.color},
              ${variant.stock},
              ${variant.sku}
            )
            on conflict (id) do nothing
          `;
        }
      }
    })();
  }

  await commerceSeedPromise;
}

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
}

async function razorpayRequest<T>(path: string, init?: RequestInit) {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const auth = Buffer.from(`${credentials.keyId}:${credentials.keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json()) as T & {
    error?: { description?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.description ?? "Razorpay request failed.");
  }

  return data;
}

function buildOrderNumber() {
  return `NOIR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function finalizeOrder(
  sessionId: string,
  payload: CheckoutPayload,
  paymentStatus: "paid" | "pending",
  paymentReference: string,
  customerId?: string,
) {
  const sql = getSql();
  const [, cart] = await Promise.all([getStoreSettings(), getCart(sessionId)]);
  if (!cart.lines.length) {
    throw new Error("Your cart is empty.");
  }

  for (const line of cart.lines) {
    if (line.quantity > line.maxQuantity) {
      throw new Error(`${line.name} is no longer available in that quantity.`);
    }
  }

  const orderNumber = buildOrderNumber();
  const createdAt = new Date().toISOString();
  const emailLog = {
    id: crypto.randomUUID(),
    recipient: payload.email,
    subject: `Order confirmation ${orderNumber}`,
    body:
      paymentStatus === "paid"
        ? `Your payment was received and order ${orderNumber} has been confirmed.`
        : `Your order ${orderNumber} has been placed and is awaiting payment confirmation.`,
    createdAt,
  };

  for (const line of cart.lines) {
    const [updated] = await sql<Array<{ id: string }>>`
      update catalog_variants
      set stock = stock - ${line.quantity}
      where id = ${line.variantId}
        and stock >= ${line.quantity}
      returning id
    `;

    if (!updated) {
      throw new Error(`${line.name} is no longer available in that quantity.`);
    }
  }

  const sqlCart = await getOrCreateSqlCart(sessionId);
  if (sqlCart) {
    await sql`delete from store_cart_lines where cart_id = ${sqlCart.id}::uuid`;
    await sql`
      update store_carts
      set promo_code = null,
          updated_at = timezone('utc', now())
      where id = ${sqlCart.id}::uuid
    `;
  }

  const [commerceOrder] = await sql<Array<{ id: string }>>`
    insert into commerce_orders (
      order_number,
      user_id,
      customer_email,
      customer_phone,
      customer_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
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
      ${orderNumber},
      ${customerId ?? null},
      ${payload.email},
      ${payload.phone},
      ${payload.name},
      ${payload.line1},
      ${payload.line2 ?? null},
      ${payload.city},
      ${payload.state},
      ${payload.postalCode},
      ${payload.country},
      ${paymentStatus},
      ${"processing"},
      ${payload.paymentMethod},
      ${paymentReference},
      ${payload.shippingMethod},
      ${cart.subtotal},
      ${cart.discountTotal},
      ${cart.shippingFee},
      ${cart.taxTotal},
      ${cart.grandTotal},
      ${createdAt}
    )
    returning id
  `;

  if (commerceOrder) {
    for (const line of cart.lines) {
      await sql`
        insert into commerce_order_items (
          order_id,
          product_name,
          product_slug,
          variant_id,
          size,
          color,
          quantity,
          unit_price
        ) values (
          ${commerceOrder.id}::uuid,
          ${line.name},
          ${line.slug},
          ${line.variantId},
          ${line.size},
          ${line.color},
          ${line.quantity},
          ${line.unitPrice}
        )
      `;
    }

    await sql`
      insert into commerce_order_emails (
        order_id,
        recipient,
        subject,
        body,
        created_at
      ) values (
        ${commerceOrder.id}::uuid,
        ${emailLog.recipient},
        ${emailLog.subject},
        ${emailLog.body},
        ${emailLog.createdAt}
      )
    `;
  }
  const result = {
    orderNumber,
    order: {
      id: commerceOrder?.id ?? crypto.randomUUID(),
      orderNumber,
      customerId: customerId ?? "",
      email: payload.email,
      phone: payload.phone,
      name: payload.name,
      addressLine1: payload.line1,
      addressLine2: payload.line2,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
      paymentStatus,
      fulfillmentStatus: "processing" as const,
      paymentProvider: payload.paymentMethod,
      paymentReference,
      shippingMethod: payload.shippingMethod,
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      shippingFee: cart.shippingFee,
      taxTotal: cart.taxTotal,
      grandTotal: cart.grandTotal,
      items: cart.lines.map((line) => ({
        id: crypto.randomUUID(),
        productName: line.name,
        productSlug: line.slug,
        variantId: line.variantId,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
      emails: [emailLog],
      createdAt,
    },
  };

  if (customerId) {
    await upsertCustomerAddressForUser(customerId, {
      name: payload.name,
      line1: payload.line1,
      line2: payload.line2,
      city: payload.city,
      state: payload.state,
      postalCode: payload.postalCode,
      country: payload.country,
      phone: payload.phone,
    });
  }

  return result;
}

function computeTotals(
  lines: CartLine[],
  settings: Pick<StoreSettings, "freeShippingThreshold" | "standardShippingFee" | "expressShippingFee">,
  promoCode?: string,
  shippingMethod = "standard",
) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const discountTotal = promoCode === PROMO_CODE ? Math.round(subtotal * 0.1) : 0;
  const shippingFee =
    subtotal === 0
      ? 0
      : shippingMethod === "express"
        ? settings.expressShippingFee
        : subtotal >= settings.freeShippingThreshold
          ? 0
          : settings.standardShippingFee;
  const taxableBase = subtotal - discountTotal;
  const taxTotal = Math.round(taxableBase * 0.12);
  const grandTotal = taxableBase + shippingFee + taxTotal;

  return { subtotal, discountTotal, shippingFee, taxTotal, grandTotal };
}

function toCard(product: ProductDetail): ProductCard {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    collection: product.collection,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    accent: product.accent,
    soldOut: product.variants.every((variant) => variant.stock < 1),
    tags: product.tags,
  };
}

function mergeSqlProducts(rows: SqlProductRow[], variants: SqlVariantRow[]) {
  return rows.map((row) => {
    const productVariants = variants
      .filter((variant) => variant.product_id === row.id)
      .map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        sku: variant.sku,
      }));

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      subcategory: row.subcategory,
      collection: row.collection_name,
      price: row.price,
      compareAtPrice: row.compare_at_price ?? undefined,
      accent: row.accent,
      soldOut: productVariants.every((variant) => variant.stock < 1),
      tags: row.tags,
      description: row.description,
      fit: row.fit,
      fabric: row.fabric,
      care: row.care,
      story: row.story,
      modelInfo: row.model_info,
      shippingNote: row.shipping_note,
      images: row.images,
      variants: productVariants,
      sizes: row.sizes,
      colors: row.colors,
    } satisfies ProductDetail;
  });
}

async function getSqlProducts(): Promise<ProductDetail[]> {
  const sql = getSql();

  await ensureCommerceSeeded();

  const [rows, variants] = await Promise.all([
    sql<SqlProductRow[]>`
      select
        id,
        slug,
        name,
        category,
        subcategory,
        collection_name,
        price,
        compare_at_price,
        accent,
        tags,
        description,
        fit,
        fabric,
        care,
        story,
        model_info,
        shipping_note,
        images,
        sizes,
        colors
      from catalog_products
      order by created_at asc
    `,
    sql<SqlVariantRow[]>`
      select id, product_id, size, color, stock, sku
      from catalog_variants
      order by created_at asc
    `,
  ]);

  return mergeSqlProducts(rows, variants);
}

async function getOrCreateSqlCart(sessionId: string): Promise<{ id: string; promo_code: string | null }> {
  const sql = getSql();
  await ensureCommerceSeeded();

  const [created] = await sql<{ id: string; promo_code: string | null }[]>`
    insert into store_carts (session_id)
    values (${sessionId})
    on conflict (session_id) do update set
      updated_at = timezone('utc', now())
    returning id, promo_code
  `;

  if (!created) {
    throw new Error("Unable to create cart.");
  }

  return created;
}

async function getSqlCartLines(sessionId: string): Promise<{ promoCode?: string; lines: CartLine[] }> {
  const sql = getSql();
  const cart = await getOrCreateSqlCart(sessionId);

  const rows = await sql<Array<{
    line_id: string;
    quantity: number;
    unit_price: number;
    product_id: string;
    slug: string;
    product_name: string;
    accent: [string, string, string];
    variant_id: string;
    size: string;
    color: string;
    stock: number;
  }>>`
    select
      l.id as line_id,
      l.quantity,
      l.unit_price,
      p.id as product_id,
      p.slug,
      p.name as product_name,
      p.accent,
      v.id as variant_id,
      v.size,
      v.color,
      v.stock
    from store_cart_lines l
    join catalog_variants v on v.id = l.variant_id
    join catalog_products p on p.id = v.product_id
    where l.cart_id = ${cart.id}::uuid
    order by l.created_at asc
  `;

  return {
    promoCode: cart.promo_code ?? undefined,
    lines: rows.map((row) => ({
      id: row.line_id,
      productId: row.product_id,
      variantId: row.variant_id,
      slug: row.slug,
      name: row.product_name,
      size: row.size,
      color: row.color,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      accent: row.accent,
      maxQuantity: row.stock,
    })),
  };
}

function sortProducts(items: ProductDetail[], sort?: string) {
  const sorted = [...items];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "best-selling":
      return sorted.sort((a, b) => Number(b.tags.includes("Bestseller")) - Number(a.tags.includes("Bestseller")));
    case "new":
      return sorted.sort((a, b) => Number(b.tags.includes("New")) - Number(a.tags.includes("New")));
    default:
      return sorted;
  }
}

export async function listProducts(query: ProductQuery = {}) {
  const products = await getSqlProducts();
  const filtered = sortProducts(products, query.sort).filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (query.subcategory && product.subcategory !== query.subcategory) return false;
    if (query.tag && !product.tags.includes(query.tag)) return false;
    if (query.color && !product.colors.includes(query.color)) return false;
    if (query.size && !product.variants.some((variant) => variant.size === query.size && variant.stock > 0)) {
      return false;
    }
    return true;
  });

  return filtered.map(toCard);
}

export async function getProductBySlug(slug: string) {
  const products = await getSqlProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts() {
  const products = await getSqlProducts();
  return products.slice(0, 4).map(toCard);
}

export async function getRecommendedProducts(slug: string) {
  const products = await getSqlProducts();
  return products
    .filter((product) => product.slug !== slug)
    .slice(0, 3)
    .map(toCard);
}

export async function getCustomerProfile(): Promise<CustomerProfile> {
  return {
    name: "",
    email: "",
    phone: "",
    addresses: [],
  };
}



export async function getOrderByNumber(orderNumber: string) {
  const sql = getSql();
  const [order] = await sql<CommerceOrderRow[]>`
    select *
    from commerce_orders
    where order_number = ${orderNumber}
    limit 1
  `;

  if (!order) {
    return null;
  }

  const [items, emails] = await Promise.all([
    sql<CommerceOrderItemRow[]>`
      select *
      from commerce_order_items
      where order_id = ${order.id}::uuid
      order by created_at asc
    `,
    sql<CommerceOrderEmailRow[]>`
      select *
      from commerce_order_emails
      where order_id = ${order.id}::uuid
      order by created_at asc
    `,
  ]);

  return {
    id: order.id,
    orderNumber: order.order_number,
    customerId: order.user_id ?? "",
    email: order.customer_email,
    phone: order.customer_phone,
    name: order.customer_name,
    addressLine1: order.address_line1,
    addressLine2: order.address_line2 ?? undefined,
    city: order.city,
    state: order.state,
    postalCode: order.postal_code,
    country: order.country,
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    paymentProvider: order.payment_provider,
    paymentReference: order.payment_reference,
    shippingMethod: order.shipping_method,
    subtotal: order.subtotal,
    discountTotal: order.discount_total,
    shippingFee: order.shipping_fee,
    taxTotal: order.tax_total,
    grandTotal: order.grand_total,
    items: items.map((item) => ({
      id: item.id,
      productName: item.product_name,
      productSlug: item.product_slug,
      variantId: item.variant_id,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
    emails: emails.map((email) => ({
      id: email.id,
      recipient: email.recipient,
      subject: email.subject,
      body: email.body,
      createdAt: email.created_at,
    })),
    createdAt: order.created_at,
  };
}

export async function getCart(sessionId: string) {
  const settings = await getStoreSettings();
  const cart = await getSqlCartLines(sessionId);
  const totals = computeTotals(cart.lines, settings, cart.promoCode);

  return {
    id: sessionId,
    currency: "INR",
    lines: cart.lines,
    promoCode: cart.promoCode,
    ...totals,
  } satisfies Cart;
}

export async function addCartItem(sessionId: string, variantId: string, quantity = 1) {
  const sql = getSql();
  await ensureCommerceSeeded();

  const [variant] = await sql<Array<{ id: string; stock: number; price: number }>>`
    select v.id, v.stock, p.price
    from catalog_variants v
    join catalog_products p on p.id = v.product_id
    where v.id = ${variantId}
    limit 1
  `;

  if (!variant || variant.stock < 1) {
    throw new Error("Variant is out of stock.");
  }

  const cart = await getOrCreateSqlCart(sessionId);
  const [existing] = await sql<Array<{ id: string; quantity: number }>>`
    select id, quantity
    from store_cart_lines
    where cart_id = ${cart.id}::uuid and variant_id = ${variantId}
    limit 1
  `;

  if (existing) {
    await sql`
      update store_cart_lines
      set quantity = ${Math.min(existing.quantity + quantity, variant.stock)}
      where id = ${existing.id}::uuid
    `;
  } else {
    await sql`
      insert into store_cart_lines (cart_id, variant_id, quantity, unit_price)
      values (${cart.id}::uuid, ${variantId}, ${Math.min(quantity, variant.stock)}, ${variant.price})
    `;
  }

  return getCart(sessionId);
}

export async function updateCartLine(sessionId: string, lineId: string, quantity: number) {
  const sql = getSql();
  const [line] = await sql<Array<{ id: string; stock: number }>>`
    select l.id, v.stock
    from store_cart_lines l
    join store_carts c on c.id = l.cart_id
    join catalog_variants v on v.id = l.variant_id
    where c.session_id = ${sessionId} and l.id = ${lineId}::uuid
    limit 1
  `;

  if (!line) {
    throw new Error("Cart line not found.");
  }

  if (quantity <= 0) {
    await sql`delete from store_cart_lines where id = ${lineId}::uuid`;
  } else {
    await sql`
      update store_cart_lines
      set quantity = ${Math.min(quantity, line.stock)}
      where id = ${lineId}::uuid
    `;
  }

  return getCart(sessionId);
}

export async function removeCartLine(sessionId: string, lineId: string) {
  const sql = getSql();
  await sql`
    delete from store_cart_lines
    where id = ${lineId}::uuid
      and cart_id in (
        select id
        from store_carts
        where session_id = ${sessionId}
      )
  `;

  return getCart(sessionId);
}

export async function applyCartPromoCode(sessionId: string, code?: string) {
  const sql = getSql();
  const cart = await getOrCreateSqlCart(sessionId);
  if (!cart) {
    throw new Error("Cart not found.");
  }

  await sql`
    update store_carts
    set promo_code = ${code?.toUpperCase() ?? null},
        updated_at = timezone('utc', now())
    where id = ${cart.id}::uuid
  `;

  return getCart(sessionId);
}

export async function createCheckoutSession(sessionId: string): Promise<CheckoutSession & { cart: Cart }> {
  const settings = await getStoreSettings();
  const cart = await getCart(sessionId);
  const hasRazorpay = Boolean(getRazorpayCredentials());

  return {
    id: `checkout_${sessionId.slice(0, 8)}`,
    paymentProvider: "razorpay",
    shippingOptions: [
      {
        id: "standard",
        label: "Standard",
        price: cart.subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee,
        eta: "2-4 business days",
      },
    ],
    paymentOptions: hasRazorpay
      ? [
          {
            id: "razorpay-test",
            label: "Razorpay Checkout",
            description: "UPI, cards, netbanking, and wallets in Razorpay test mode.",
          },
        ]
      : [],
    note: "Online payments are verified server-side before orders are marked paid.",
    cart,
  };
}

export async function placeOrder(sessionId: string, payload: CheckoutPayload) {
  if (payload.paymentMethod !== "razorpay-test") {
    throw new Error("Only Razorpay checkout is available.");
  }

  throw new Error("Use the Razorpay payment flow for checkout.");
}

export async function createRazorpayOrder(sessionId: string, payload: CheckoutPayload, customerId?: string) {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const settings = await getStoreSettings();
  const enabledPaymentMethods = settings.paymentMethods.filter((method) => method.enabled);
  if (!enabledPaymentMethods.some((method) => method.id === "razorpay-test")) {
    throw new Error("Razorpay is not enabled.");
  }

  const cart = await getCart(sessionId);
  if (!cart.lines.length) {
    throw new Error("Your cart is empty.");
  }

  const expectedAmount = cart.grandTotal * 100;
  const data = await razorpayRequest<{ id?: string }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: expectedAmount,
      currency: "INR",
      receipt: `rcpt_${sessionId.slice(0, 10)}_${Date.now().toString().slice(-6)}`,
      notes: {
        sessionId,
        customerEmail: payload.email,
        shippingMethod: payload.shippingMethod,
        paymentMethod: payload.paymentMethod,
      },
    }),
  });

  if (!data.id) {
    throw new Error("Unable to create Razorpay order.");
  }
  const razorpayOrderId = data.id;

  const sql = getSql();
  await sql`
    delete from pending_payments
    where session_id = ${sessionId}
  `;
  await sql`
    insert into pending_payments (
      session_id,
      customer_id,
      razorpay_order_id,
      expected_amount,
      currency,
      status,
      payload
    ) values (
      ${sessionId},
      ${customerId ?? null},
      ${data.id},
      ${expectedAmount},
      'INR',
      'created',
      ${sql.json(payload)}
    )
  `;

  return {
    keyId: credentials.keyId,
    orderId: razorpayOrderId,
    amount: expectedAmount,
    currency: "INR",
    brandName: settings.brandName,
    description: `${settings.brandName} purchase`,
    prefill: {
      name: payload.name,
      email: payload.email,
      contact: payload.phone,
    },
  };
}

export async function verifyRazorpayPayment(
  sessionId: string,
  payment: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  },
) {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const sql = getSql();
  if (sql) {
    const [pending] = await sql<Array<{
      session_id: string;
      customer_id: string | null;
      razorpay_order_id: string;
      expected_amount: number;
      currency: string;
      status: "created" | "captured" | "failed";
      payload: CheckoutPayload;
    }>>`
      select session_id, customer_id, razorpay_order_id, expected_amount, currency, status, payload
      from pending_payments
      where session_id = ${sessionId} and razorpay_order_id = ${payment.razorpayOrderId}
      limit 1
    `;

    if (!pending) {
      throw new Error("Pending payment not found.");
    }

    if (pending.status === "captured") {
      throw new Error("This payment has already been finalized.");
    }

    const signaturePayload = `${pending.razorpay_order_id}|${payment.razorpayPaymentId}`;
    const expectedSignature = createHmac("sha256", credentials.keySecret)
      .update(signaturePayload)
      .digest("hex");

    if (expectedSignature !== payment.razorpaySignature) {
      await sql`
        update pending_payments
        set status = 'failed',
            razorpay_payment_id = ${payment.razorpayPaymentId},
            failure_reason = 'Razorpay signature verification failed.'
        where razorpay_order_id = ${payment.razorpayOrderId}
      `;
      throw new Error("Razorpay signature verification failed.");
    }

    const paymentDetails = await razorpayRequest<{
      id?: string;
      order_id?: string;
      amount?: number;
      currency?: string;
      status?: string;
      captured?: boolean;
    }>(`/payments/${payment.razorpayPaymentId}`);

    const isCaptured = paymentDetails.status === "captured" || paymentDetails.captured === true;

    if (
      paymentDetails.order_id !== pending.razorpay_order_id ||
      paymentDetails.amount !== pending.expected_amount ||
      paymentDetails.currency !== pending.currency
    ) {
      await sql`
        update pending_payments
        set status = 'failed',
            razorpay_payment_id = ${payment.razorpayPaymentId},
            failure_reason = 'Razorpay payment details did not match the expected order.'
        where razorpay_order_id = ${payment.razorpayOrderId}
      `;
      throw new Error("Payment verification failed against Razorpay records.");
    }

    if (!isCaptured) {
      await sql`
        update pending_payments
        set status = 'failed',
            razorpay_payment_id = ${payment.razorpayPaymentId},
            failure_reason = 'Razorpay payment is not captured yet. Keep auto-capture enabled in test mode.'
        where razorpay_order_id = ${payment.razorpayOrderId}
      `;
      throw new Error("Payment is not captured yet.");
    }

    const result = await finalizeOrder(
      sessionId,
      pending.payload,
      "paid",
      payment.razorpayPaymentId,
      pending.customer_id ?? undefined,
    );

    if (pending.customer_id) {
      await upsertCustomerAddressForUser(pending.customer_id, {
        name: pending.payload.name,
        line1: pending.payload.line1,
        line2: pending.payload.line2,
        city: pending.payload.city,
        state: pending.payload.state,
        postalCode: pending.payload.postalCode,
        country: pending.payload.country,
        phone: pending.payload.phone,
      });
      await mirrorOrderForUser({
        userId: pending.customer_id,
        order: result.order,
      });
    }

    await sql`
      delete from pending_payments
      where razorpay_order_id = ${payment.razorpayOrderId}
    `;

    return { orderNumber: result.orderNumber };
  }
}

export async function getAdminDashboard() {
  const sql = getSql();
  await ensureCommerceSeeded();
  const [[stats]] = await Promise.all([
    sql<Array<{
      total_products: number;
      inventory_units: number;
      total_orders: number;
      revenue: number;
    }>>`
      select
        (select count(*)::int from catalog_products) as total_products,
        coalesce((select sum(stock)::int from catalog_variants), 0) as inventory_units,
        (select count(*)::int from commerce_orders) as total_orders,
        coalesce((select sum(grand_total)::int from commerce_orders), 0) as revenue
    `,
  ]);

  return {
    totalProducts: stats?.total_products ?? 0,
    totalOrders: stats?.total_orders ?? 0,
    revenue: stats?.revenue ?? 0,
    inventoryUnits: stats?.inventory_units ?? 0,
  };
}

export async function getAdminProducts() {
  return getSqlProducts();
}

export async function getAdminOrders() {
  const sql = getSql();
  const rows = await sql<AdminOrderRow[]>`
    select
      o.*,
      i.id as item_id,
      i.product_name,
      i.size,
      i.color,
      i.quantity
    from commerce_orders o
    left join commerce_order_items i on i.order_id = o.id
    order by o.created_at desc, i.created_at asc
  `;

  const mapped = new Map<
    string,
    {
      id: string;
      orderNumber: string;
      createdAt: string;
      paymentStatus: OrderSummary["paymentStatus"];
      fulfillmentStatus: OrderSummary["fulfillmentStatus"];
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
    }
  >();
  rows.forEach((row) => {
    const existing = mapped.get(row.id);
    if (existing) {
      if (row.item_id && row.product_name && row.size && row.color && row.quantity !== null) {
        existing.items.push({
          id: row.item_id,
          productName: row.product_name,
          size: row.size,
          color: row.color,
          quantity: row.quantity,
        });
      }
      return;
    }

    mapped.set(row.id, {
      id: row.id,
      orderNumber: row.order_number,
      createdAt: row.created_at,
      paymentStatus: row.payment_status,
      fulfillmentStatus: row.fulfillment_status,
      grandTotal: row.grand_total,
      name: row.customer_name,
      email: row.customer_email,
      items: row.item_id && row.product_name && row.size && row.color && row.quantity !== null
        ? [
            {
              id: row.item_id,
              productName: row.product_name,
              size: row.size,
              color: row.color,
              quantity: row.quantity,
            },
          ]
        : [],
    });
  });

  return [...mapped.values()];
}

type AdminProductPayload = {
  name: string;
  slug: string;
  category: ProductDetail["category"];
  subcategory: ProductDetail["subcategory"];
  collection: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  fit: ProductDetail["fit"];
  fabric: string;
  story: string;
  modelInfo: string;
  shippingNote: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  initialStock: number;
};

export async function createAdminProduct(payload: AdminProductPayload) {
  const sql = getSql();
  await ensureCommerceSeeded();
  const [existing] = await sql<Array<{ id: string }>>`
    select id from catalog_products where slug = ${payload.slug} limit 1
  `;
  if (existing) {
    throw new Error("A product with that slug already exists.");
  }

  const productId = `p-${crypto.randomUUID().slice(0, 8)}`;
  const images = [0, 1, 2].map((index) => ({
    id: `img-${crypto.randomUUID().slice(0, 8)}`,
    label: ["Campaign", "Studio", "Detail"][index] ?? `Image ${index + 1}`,
    palette: DEFAULT_ACCENT,
  }));
  const variants = payload.colors.flatMap((color) =>
    payload.sizes.map((size) => ({
      id: `v-${crypto.randomUUID().slice(0, 8)}`,
      size,
      color,
      stock: payload.initialStock,
      sku: `${payload.slug.toUpperCase().replace(/-/g, "_")}_${size}_${color}`.replace(/\s+/g, "_"),
    })),
  );

  await sql`
    insert into catalog_products (
      id, slug, name, category, subcategory, collection_name, price, compare_at_price,
      accent, tags, description, fit, fabric, care, story, model_info, shipping_note, images, sizes, colors
    ) values (
      ${productId}, ${payload.slug}, ${payload.name}, ${payload.category}, ${payload.subcategory}, ${payload.collection},
      ${payload.price}, ${payload.compareAtPrice ?? null}, ${sql.json(DEFAULT_ACCENT)}, ${sql.json(payload.tags)},
      ${payload.description}, ${payload.fit}, ${payload.fabric}, ${sql.json(["Cold wash", "Line dry", "Handle with care"])},
      ${payload.story}, ${payload.modelInfo}, ${payload.shippingNote}, ${sql.json(images)}, ${sql.json(payload.sizes)}, ${sql.json(payload.colors)}
    )
  `;

  for (const variant of variants) {
    await sql`
      insert into catalog_variants (id, product_id, size, color, stock, sku)
      values (${variant.id}, ${productId}, ${variant.size}, ${variant.color}, ${variant.stock}, ${variant.sku})
    `;
  }

  const products = await getSqlProducts();
  return products?.find((product) => product.id === productId) ?? null;
}

export async function updateAdminProduct(
  productId: string,
  payload: Partial<
    Pick<
      ProductDetail,
      | "name"
      | "category"
      | "subcategory"
      | "collection"
      | "price"
      | "compareAtPrice"
      | "description"
      | "fit"
      | "fabric"
      | "story"
      | "modelInfo"
      | "shippingNote"
    >
  > & { variantStock?: Record<string, number> },
) {
  const sql = getSql();
  await ensureCommerceSeeded();
  const products = await getSqlProducts();
  const product = products?.find((entry) => entry.id === productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  await sql`
    update catalog_products
    set
      name = ${payload.name ?? product.name},
      category = ${payload.category ?? product.category},
      subcategory = ${payload.subcategory ?? product.subcategory},
      collection_name = ${payload.collection ?? product.collection},
      price = ${payload.price ?? product.price},
      compare_at_price = ${payload.compareAtPrice ?? product.compareAtPrice ?? null},
      description = ${payload.description ?? product.description},
      fit = ${payload.fit ?? product.fit},
      fabric = ${payload.fabric ?? product.fabric},
      story = ${payload.story ?? product.story},
      model_info = ${payload.modelInfo ?? product.modelInfo},
      shipping_note = ${payload.shippingNote ?? product.shippingNote},
      updated_at = timezone('utc', now())
    where id = ${productId}
  `;

  if (payload.variantStock) {
    for (const [variantId, stock] of Object.entries(payload.variantStock)) {
      await sql`
        update catalog_variants
        set stock = ${Math.max(0, stock)}
        where id = ${variantId} and product_id = ${productId}
      `;
    }
  }

  const refreshed = await getSqlProducts();
  return refreshed?.find((entry) => entry.id === productId) ?? null;
}

export async function deleteAdminProduct(productId: string) {
  const sql = getSql();
  await ensureCommerceSeeded();
  const [product] = await sql<Array<{ id: string }>>`
    select id from catalog_products where id = ${productId} limit 1
  `;
  if (!product) {
    throw new Error("Product not found.");
  }
  await sql`delete from wishlist_items where product_id = ${productId}`;
  await sql`
    delete from store_cart_lines
    where variant_id in (select id from catalog_variants where product_id = ${productId})
  `;
  await sql`delete from catalog_products where id = ${productId}`;
  return true;
}

export async function updateAdminOrder(
  orderId: string,
  payload: {
    paymentStatus?: OrderSummary["paymentStatus"];
    fulfillmentStatus?: OrderSummary["fulfillmentStatus"];
  },
) {
  const sql = getSql();
  const [current] = await sql<CommerceOrderRow[]>`
    select *
    from commerce_orders
    where id = ${orderId}::uuid
    limit 1
  `;
  if (!current) {
    throw new Error("Order not found.");
  }

  const nextPaymentStatus = payload.paymentStatus ?? current.payment_status;
  const nextFulfillmentStatus = payload.fulfillmentStatus ?? current.fulfillment_status;

  const [updated] = await sql<CommerceOrderRow[]>`
    update commerce_orders
    set
      payment_status = ${nextPaymentStatus},
      fulfillment_status = ${nextFulfillmentStatus},
      updated_at = timezone('utc', now())
    where id = ${orderId}::uuid
    returning *
  `;

  if (updated?.user_id) {
    await sql`
      update customer_orders
      set
        payment_status = ${nextPaymentStatus},
        fulfillment_status = ${nextFulfillmentStatus}
      where order_number = ${updated.order_number}
    `;
  }

  return updated;
}
