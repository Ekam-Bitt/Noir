# Noir Chapter | Premium Clothing Storefront

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-020425?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

An India-first, cinematic fashion storefront designed for premium collection drops. Built with a "less talk, more form" philosophy, this repository provides a high-performance, SEO-optimized commerce engine.

---

## ✨ Key Features

- **Cinematic Collection Drops**: Editorial-led storytelling for capsule collections (Chapters).
- **Premium UX/UI**: High-fidelity design system featuring glassmorphism, grain textures, and fluid animations.
- **Robust Commerce Engine**: Full lifecycle management from catalogue and inventory to checkout and fulfillment.
- **Unified Auth & Account**: Seamless sign-in with Supabase Auth, persistent wishlists, and order history.
- **Integrated Admin Panel**: Browser-based management for products, collection stories, and order processing.
- **SEO Optimized**: Dynamic sitemaps, robots configuration, and rich metadata for all products and collections.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | **Next.js 16.2** (App Router) |
| **Styling** | **Tailwind CSS 4.0** |
| **Database** | **PostgreSQL** (via Supabase) |
| **Authentication** | **Supabase Auth** (SSR logic) |
| **Payments** | **Razorpay** (Signature-verified) |
| **ORM/Queries** | **Postgres.js** (Direct SQL) |
| **Validation** | **Zod** |

---

## 🏛️ Project Architecture

```text
src/
├── app/            # Next.js App Router (Pages, API, Sitemaps)
├── components/     # UI Components (Client & Server)
│   ├── admin/      # Admin-specific modules
│   ├── cart/       # Logic-heavy shopping cart
│   ├── layout/     # Shell, Header, Footer
│   └── product/    # Product displays & grids
├── lib/
│   ├── auth/       # Supabase Auth helpers
│   ├── services/   # Business logic (Commerce, Content, Customer)
│   ├── server/     # Server-only utilities (Postgres connection)
│   └── utils.ts    # Shared TypeScript utilities
supabase/
└── migrations/     # SQL schema and RLS policies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- Razorpay API keys (Test/Live)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ekam-Bitt/shop01.git
   cd shop01
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="yours"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="yours"
   SUPABASE_SERVICE_ROLE_KEY="yours"
   POSTGRES_URL="yours"

   # Razorpay
   RAZORPAY_KEY_ID="yours"
   RAZORPAY_KEY_SECRET="yours"
   ```

4. **Initialize Database**
   Migrations are automatically applied or can be run via the Supabase dashboard. Seed data is inserted into Postgres on the first application run.

5. **Start Development**
   ```bash
   npm run dev
   ```

---

## 🌐 SEO & Performance

The project is optimized for search engines and performance:
- **Dynamic Sitemap**: Automatically updated via `src/app/sitemap.ts`.
- **Global Metadata**: Centralized in `layout.tsx` with OpenGraph and Twitter support.
- **Image Optimization**: Leveraging Next.js `Image` component with priority loading for key hero assets.
- **SSR-First**: Dynamic data fetching ensures search engines see full content on first paint.

---

## 🚢 Deployment

1. **Supabase Setup**:
   - Create a new project.
   - Run the migrations found in `supabase/migrations`.
   - Configure public storage bucket `product-images`.

2. **Vercel Deployment**:
   - Connect your GitHub repository.
   - Add all environment variables from `.env.local`.
   - Deployment will automatically set the production domain (e.g., `shop-noir.vercel.app`).

---

## 🛡️ Admin & Operational Security

- **Admin Guard**: The `/admin` routes are protected via Supabase Auth metadata. Users must have `app_metadata.role = 'admin'` to access.
- **Data Integrity**: Stock levels are safely decremented during the checkout flow using atomic Postgres operations.
- **Payment Verification**: Razorpay signatures are verified server-side before order finalization.

---

## 📄 License

Internal use only for **Noir Chapter**.
