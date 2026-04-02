# Noir Chapter Storefront

A premium, India-first fashion storefront built with Next.js App Router, Razorpay checkout, Supabase Auth, and Postgres-backed commerce.

## What is implemented

- Modern premium storefront UI with responsive homepage, PLP, PDP, collection story pages, archive, about, FAQ, shipping, contact, wishlist, account, cart, and checkout.
- Typed commerce and content service layers so the UI stays cleanly separated from infrastructure.
- Persistent seeded catalogue with categories, collections, variants, inventory, compare-at pricing, storytelling metadata, and recommendation rails.
- Postgres-backed product catalogue, variants, stock, carts, pending payment state, customer profiles, saved addresses, wishlist persistence, and mirrored customer order history.
- Real backend-backed checkout, order creation, stock deduction, and confirmation flow.
- Supabase Auth login/signup flow with protected customer profile, wishlist, and admin route guard support.
- Postgres-backed customer profiles, saved addresses, wishlist persistence, and mirrored order history for signed-in customers.
- Browser-manageable admin panel for products, drops, and order operations.
- API routes for products, product detail, cart, wishlist, account, orders, and checkout session.
- SEO basics including metadata and product structured data.

## Current architecture

- `src/app/*`: App Router pages and API routes.
- `src/components/*`: reusable storefront UI, cart, layout, and product components.
- `src/lib/services/*`: typed service adapters used by pages and APIs.
- `src/lib/supabase/*`: Supabase auth clients and environment helpers.
- `src/lib/server/postgres.ts`: Postgres connection for catalogue, checkout, content, orders, and customer data.
- `src/lib/services/customer-account.ts`: Postgres-backed customer profile, wishlist, address, and order history services.
- `src/lib/data/store.ts`: seeded content and catalogue fixtures used to initialize a fresh Postgres database.
- `supabase/migrations/*`: production database and storage migrations for auth-linked customer data, catalogue, variants, carts, pending payments, store settings, drops, FAQs, lookbooks, orders, and product image storage.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Add these in `.env.local`:

```bash
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
POSTGRES_URL=your_supabase_pooler_or_direct_postgres_url
```

This project now assumes a real Supabase + Postgres setup in every environment. On a fresh database, the catalogue and editorial seed data are inserted into Postgres automatically on first use.

## Hosted setup for client handover

1. Create a Supabase project for the client brand.
2. Apply the database migrations in [`supabase/migrations/20240101000000_init.sql`](/Users/ekambitt/Projects/shop/supabase/migrations/20240101000000_init.sql) and [`supabase/migrations/20260401000000_product_images_storage.sql`](/Users/ekambitt/Projects/shop/supabase/migrations/20260401000000_product_images_storage.sql), or run the full migration set through the Supabase CLI.
3. In Supabase Auth:
   Set the site URL and redirect URLs for the production domain and approved preview/local domains.
4. Create the first admin user in Supabase Auth.
5. Set that user’s `app_metadata.role` to `admin`.
6. Add the environment variables above to Vercel or the hosting platform.
7. Deploy the app.

## Production auth behavior

- `/auth/login` handles sign in and account creation.
- `/account` and `/wishlist` require a signed-in Supabase user.
- `/admin/*` requires a signed-in user with `app_metadata.role = admin`.
- Signed-in checkout uses the authenticated customer profile as the order owner.
- Verified Razorpay orders are mirrored into Postgres so they appear in the customer account history.
- Product catalogue, inventory, cart lines, pending Razorpay payment state, store settings, drops, FAQs, lookbooks, and operational order records are sourced from Postgres.

## Demo flow to test

- Browse `/products`
- Add a variant to cart
- Apply promo code `NOIR10`
- Go through `/checkout`
- Place a test order
- Open `/checkout/success/<orderNumber>` after redirect
- Sign up at `/auth/login`
- Check `/account` for profile and mirrored order history
- Check `/wishlist` for saved items
- Open `/admin`, `/admin/products`, `/admin/drops`, and `/admin/orders` to manage the store from the browser

## Admin capabilities

- Create products with generated variants from comma-separated sizes and colors
- Upload hosted product images from inventory and serve them through Supabase Storage public URLs
- Update product collection, pricing, and per-variant stock
- Create and edit drops/collection story pages
- Delete products from the live catalogue
- Review orders and update payment or fulfillment status

## Production handover notes

- The client can manage catalogue, drops, and orders from the browser without editing code.
- Brand voice, visual direction, homepage composition, and global storefront settings are developer-controlled.
- Customer identity is production-backed through Supabase Auth.
- Customer profiles, wishlist data, saved addresses, order history, catalogue, inventory, carts, pending payment state, store settings, drops, lookbooks, FAQs, and operational orders all live in Postgres.
- Product images are stored in Supabase Storage, uploaded through admin-only API routes, and served from the `product-images` public bucket.
- The project creates Razorpay orders, verifies signatures server-side, and checks payment capture via Razorpay’s API. Before launch, replace test keys with the client’s live keys and add production webhook handling.

## Suggested next integrations

### Final production cleanup

- Decide whether brand/editorial management should stay in Postgres-backed admin tables or move into Sanity for a richer content-editor workflow.
- Add production Razorpay webhooks and reconciliation jobs so payment state can be recovered independently of the browser callback.
- Add order fulfillment tooling such as shipment IDs, courier tracking, returns, and refund workflows on top of the current Postgres order source-of-truth.

### Sanity

- Replace `src/lib/services/content.ts` with a Sanity client and schema-backed content queries.
- Model homepage modules, collection story pages, archive entries, and brand pages in Sanity Studio.

### Razorpay

- Replace test keys with live Razorpay credentials and add webhook confirmation.
- Only mark orders paid after server-side verification succeeds.

## Verification

```bash
npm run lint
npm run build
```
