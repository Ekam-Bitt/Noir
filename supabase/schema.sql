create extension if not exists pgcrypto;

create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references customer_profiles(id) on delete cascade,
  name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists wishlist_items (
  user_id uuid not null references customer_profiles(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, product_id)
);

create table if not exists catalog_products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  subcategory text not null,
  collection_name text not null,
  price integer not null,
  compare_at_price integer,
  accent jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  description text not null,
  fit text not null,
  fabric text not null,
  care jsonb not null default '[]'::jsonb,
  story text not null,
  model_info text not null,
  shipping_note text not null,
  images jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists catalog_variants (
  id text primary key,
  product_id text not null references catalog_products(id) on delete cascade,
  size text not null,
  color text not null,
  stock integer not null default 0,
  sku text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_catalog_products_slug on catalog_products(slug);
create index if not exists idx_catalog_products_category on catalog_products(category);
create index if not exists idx_catalog_products_subcategory on catalog_products(subcategory);
create index if not exists idx_catalog_variants_product_id on catalog_variants(product_id);

create table if not exists store_carts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  customer_id uuid,
  promo_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists store_cart_lines (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references store_carts(id) on delete cascade,
  variant_id text not null references catalog_variants(id) on delete cascade,
  quantity integer not null,
  unit_price integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_store_cart_lines_cart_id on store_cart_lines(cart_id);

create table if not exists pending_payments (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  customer_id uuid,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  expected_amount integer not null,
  currency text not null default 'INR',
  status text not null check (status in ('created', 'captured', 'failed')),
  payload jsonb not null,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  verified_at timestamptz
);

create index if not exists idx_pending_payments_session_id on pending_payments(session_id);

create table if not exists store_settings (
  id integer primary key default 1,
  brand_name text not null,
  logo_text text not null,
  brand_tagline text not null,
  announcement text not null,
  hero_title text not null,
  hero_copy text not null,
  hero_cta text not null,
  hero_secondary_cta text not null,
  marquee jsonb not null default '[]'::jsonb,
  newsletter_heading text not null,
  newsletter_placeholder text not null,
  about_headline text not null,
  about_body text not null,
  laboratory_title text not null,
  laboratory_body text not null,
  faq_title text not null,
  shipping_title text not null,
  contact_email text not null,
  contact_phone text not null,
  contact_hours text not null,
  brand_canvas text not null,
  brand_ink text not null,
  brand_accent text not null,
  payment_methods jsonb not null default '[]'::jsonb,
  free_shipping_threshold integer not null,
  standard_shipping_fee integer not null,
  express_shipping_fee integer not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists collection_stories (
  slug text primary key,
  title text not null,
  eyebrow text not null,
  intro text not null,
  narrative text not null,
  mood text not null,
  palette jsonb not null default '[]'::jsonb,
  featured_product_slugs jsonb not null default '[]'::jsonb,
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists lookbook_entries (
  slug text primary key,
  title text not null,
  season text not null,
  caption text not null,
  palette jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists commerce_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references customer_profiles(id) on delete set null,
  customer_email text not null,
  customer_phone text not null,
  customer_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  payment_status text not null check (payment_status in ('paid', 'pending', 'failed', 'refunded')),
  fulfillment_status text not null check (fulfillment_status in ('processing', 'shipped', 'delivered', 'returned')),
  payment_provider text not null,
  payment_reference text not null,
  shipping_method text not null,
  subtotal integer not null,
  discount_total integer not null default 0,
  shipping_fee integer not null default 0,
  tax_total integer not null default 0,
  grand_total integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references commerce_orders(id) on delete cascade,
  product_name text not null,
  product_slug text not null,
  variant_id text not null,
  size text not null,
  color text not null,
  quantity integer not null,
  unit_price integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists commerce_order_emails (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references commerce_orders(id) on delete cascade,
  recipient text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_commerce_orders_user_id on commerce_orders(user_id);
create index if not exists idx_commerce_order_items_order_id on commerce_order_items(order_id);
create index if not exists idx_commerce_order_emails_order_id on commerce_order_emails(order_id);

create table if not exists customer_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references customer_profiles(id) on delete cascade,
  order_number text not null unique,
  payment_status text not null check (payment_status in ('paid', 'pending', 'failed', 'refunded')),
  fulfillment_status text not null check (fulfillment_status in ('processing', 'shipped', 'delivered', 'returned')),
  payment_provider text not null,
  payment_reference text not null,
  shipping_method text not null,
  subtotal integer not null,
  discount_total integer not null default 0,
  shipping_fee integer not null default 0,
  tax_total integer not null default 0,
  grand_total integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists customer_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references customer_orders(id) on delete cascade,
  product_name text not null,
  product_slug text not null,
  variant_id text not null,
  size text not null,
  color text not null,
  quantity integer not null,
  unit_price integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table customer_profiles enable row level security;
alter table customer_addresses enable row level security;
alter table wishlist_items enable row level security;
alter table customer_orders enable row level security;
alter table customer_order_items enable row level security;

create policy "Customers read own profile" on customer_profiles
  for select using (auth.uid() = id);
create policy "Customers update own profile" on customer_profiles
  for update using (auth.uid() = id);
create policy "Customers insert own profile" on customer_profiles
  for insert with check (auth.uid() = id);

create policy "Customers manage own addresses" on customer_addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Customers manage own wishlist" on wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Customers read own orders" on customer_orders
  for select using (auth.uid() = user_id);

create policy "Customers read own order items" on customer_order_items
  for select using (
    exists (
      select 1
      from customer_orders
      where customer_orders.id = customer_order_items.order_id
        and customer_orders.user_id = auth.uid()
    )
  );
