# CJ Hubs

A production-quality, full-stack e-commerce platform for curated shopping: Next.js 14 (App Router) + TypeScript, a PostgreSQL database via Prisma, real authentication, a real shopping cart and checkout, and a full admin dashboard for products, categories, orders and customers.

This is a real application — not a static mockup. Every page listed below reads and writes to the database through actual API routes. The storefront is organized around two shopping lanes — **Gift Ideas** and **Products & Accessories** — matching cjhubs.com.

---

## 1. What's built

**Storefront**
- Home, product catalog (search/filter/sort/pagination), product detail pages, cart, checkout, order confirmation
- Two curated categories on the homepage: Gift Ideas and Products & Accessories
- Customer accounts: register, login, logout, profile + order history + saved addresses
- Light/dark mode with a navy-and-gold brand identity, glassmorphism, animated hero and stats, Framer Motion micro-interactions, `prefers-reduced-motion` support
- A `react-three-fiber` 3D scene (a glowing gold hub gem, orbit rings, floating gift boxes) layered behind the hero's HUD card — lazy-loaded, skipped entirely without WebGL or under `prefers-reduced-motion`, so the original CSS hero art always works as the fallback
- Pointer-driven 3D tilt on product cards (`useTilt` hook), a dependency-free top-of-page route progress bar, and an animated loader used across route `loading.tsx` states
- SEO: per-product metadata, Open Graph tags, `sitemap.xml`, `robots.txt`

**Admin dashboard** (`/admin`, protected by middleware + server-side role checks)
- Dashboard: revenue, order/product/customer counts, low-stock alerts, recent orders
- Products: full CRUD with a multi-section form (basic info, pricing, inventory, images, specifications, shipping, SEO, publishing)
- Categories: CRUD with a modal editor
- Orders: list with status filters, per-order detail, editable order/payment status (cancelling restocks inventory automatically)
- Customers: list with order counts and lifetime value

**Backend**
- REST-style API routes under `src/app/api/*`, organized by domain (auth, products, categories, brands, cart, checkout, orders, admin/*, addresses, wishlist)
- JWT-based sessions in httpOnly cookies, bcrypt password hashing, role-based guards (`requireUser` / `requireAdmin`), edge middleware protecting `/admin` and `/account`
- Zod validation on every write endpoint, consistent `{ success, data }` / `{ success, error }` responses, no internal errors leaked to the client
- Real inventory logic: stock is re-validated and decremented at checkout inside a DB transaction; cancelling an order restocks it
- Order numbers like `CJH-20260901-0001`; historical orders store the price paid, not a live product price lookup

**Integrations (isolated, server-only, clearly stubbed until configured)**
- `src/lib/integrations/supplier.ts` — a supplier/catalog sync adapter with `TODO` markers for the real endpoint contract
- `src/lib/integrations/paystack.ts` — a Paystack payment adapter. If `PAYSTACK_SECRET_KEY` isn't set, checkout still works and creates a real `PENDING` order instead of faking a successful payment
- Payment confirmation is real, not just initiation: `POST /api/payments/paystack/webhook` verifies Paystack's `x-paystack-signature` (HMAC-SHA512) and marks orders `PAID`/`FAILED`; `GET /api/payments/paystack/verify/[reference]` is a client-polled fallback for the rare case the webhook lags behind the redirect back to the order page. Every verified delivery is logged to a `WebhookEvent` table (keyed on Paystack's transaction id, so retried deliveries are a safe no-op) and visible at `/admin/webhooks`. In Paystack's dashboard (Settings → API Keys & Webhooks), point the webhook URL at `{NEXT_PUBLIC_SITE_URL}/api/payments/paystack/webhook` — no separate webhook secret needed, it's signed with `PAYSTACK_SECRET_KEY`

---

## 2. Project structure

```
cjhubs/
├── prisma/
│   ├── schema.prisma        # Full data model (users, products, orders, etc.)
│   └── seed.ts               # Demo gift/product catalog, categories, brands, admin/demo accounts
├── src/
│   ├── app/
│   │   ├── api/               # All backend route handlers
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── products/          # Storefront catalog + product detail
│   │   ├── cart/ checkout/ orders/ account/ login/ register/ ...
│   │   └── layout.tsx, page.tsx, globals.css
│   ├── components/
│   │   ├── ui/                 # Buttons, inputs, badges, skeletons, etc.
│   │   ├── layout/              # Navbar, footer, theme toggle, logo
│   │   ├── home/ products/ admin/ account/
│   ├── lib/                    # prisma client, auth, validation, api-response, integrations/
│   ├── store/                  # Zustand cart store (persisted client-side)
│   └── types/
├── middleware.ts               # Protects /admin and /account routes
├── .env.example
└── package.json
```

---

## 3. Required environment variables

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=              # PostgreSQL connection string
JWT_SECRET=                # Long random string
JWT_EXPIRES_IN=7d
COOKIE_NAME=cjh_session

NEXT_PUBLIC_SITE_NAME=CJ Hubs
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional — supplier catalog sync (see src/lib/integrations/supplier.ts)
API_KEY=
API_BASE_URL=

# Optional — payments (see src/lib/integrations/paystack.ts)
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
```

Secrets are never imported into client components and are never returned by any API response.

---

## 4. Database setup

```bash
npm install
npx prisma migrate dev --name init   # creates tables in your PostgreSQL database
npm run seed                         # loads demo products, categories, admin + demo accounts
```

**Using Neon (or any pooled PostgreSQL provider)?** Set `DATABASE_URL` to the pooled connection string and `DATABASE_URL_DIRECT` to the non-pooled one (`prisma/schema.prisma` uses `directUrl` for this) — poolers like PgBouncer in transaction mode don't reliably support the prepared statements `prisma migrate` needs, so migrations run over the direct connection while the app itself uses the pooled one at runtime. If you'd rather skip migration history and just sync the schema straight to a fresh database (fine for a new Neon project, not recommended once you have real data), `npm run prisma:push` does that in one step.

Demo accounts created by the seed script:
- **Admin:** `admin@cjhubs.com` / `Admin@12345`
- **Customer:** `demo@cjhubs.com` / `Customer@12345`

---

## 5. Development commands

```bash
npm run dev              # start the dev server on http://localhost:3000
npm run prisma:studio    # browse/edit the database visually
npm run prisma:push      # sync schema to the DB without a migration file (quick setup / prototyping)
npm run lint             # ESLint
```

Once running, `GET /api/health` reports database connectivity and which optional integrations (Paystack, site URL) are configured — useful for confirming a fresh environment is wired up correctly before clicking through the UI.

## 6. Production build

```bash
npm run build
npm run start
```

Run `npx prisma migrate deploy` against your production database before starting the app in a new environment.

---

## 7. What remains to be configured

This app deliberately does **not** fake functionality that depends on credentials it wasn't given:

- **Payments** — Add `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` to enable live Paystack checkout, and point Paystack's webhook at `{NEXT_PUBLIC_SITE_URL}/api/payments/paystack/webhook` so orders are confirmed automatically. Until configured, orders are created as `PENDING`/`UNPAID` and an admin marks them paid manually from `/admin/orders/[id]`.
- **Supplier/catalog API** — Add `API_KEY` and `API_BASE_URL`, then fill in the two `TODO(integration)` endpoints in `src/lib/integrations/supplier.ts` to enable `POST /api/admin/sync-catalog`.
- **Transactional email** — Password-reset tokens are generated and logged server-side (`src/app/api/auth/forgot-password/route.ts`) but not yet emailed; wire in a provider like Resend/SendGrid/Postmark.
- **Newsletter** — The footer form is UI-complete but not yet connected to a mailing list provider.
- **Image hosting** — Seed data and admin image fields currently take a URL. For production, wire in a real upload flow (e.g. S3/Cloudinary) and add the resulting domain to `next.config.js` → `images.remotePatterns`.
- **A dedicated build/typecheck pass in a real environment** — see note below.

### A note on this rebrand

This project began as a solar-energy storefront template and was rebranded into CJ Hubs — a curated gift-and-products shop — by restyling the front end (colors, copy, logo, 3D hero visual, seed data) while leaving the backend (schema, auth, cart/checkout logic, payment integration) unchanged. A few `Product` fields inherited from the original schema (`voltage`, `wattage`, `batteryCapacity`, `inverterCapacity`, `installationInfo`) are optional and simply left blank for gift/product listings; they're harmless to leave as-is, or you can drop them in a follow-up migration if you'd rather trim the schema down.

### A note on verification

This project was built and reviewed in a sandboxed environment with no outbound network access at all in its later session, so **`npm install` itself could not be run** to add `three` / `@react-three/fiber` (they're declared in `package.json` but were never actually downloaded or type-checked here), and a full `next build`/`tsc` pass wasn't possible either. Everything was written and manually reviewed for structural/import correctness, but you should run `npm install && npx prisma generate && npm run build` yourself as the very first step — that's the first real compiler pass this code will get, and it's likely to surface at least minor issues in the 3D scene, tilt hook, or payment routes.
