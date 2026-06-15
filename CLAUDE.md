# CLAUDE.md — Perfume Shop (AURA Signature)

This is a Next.js 16 full-stack e-commerce application for perfume sales.

## Tech Stack

- **Framework:** Next.js 16.2.1 (App Router, Turbopack)
- **Database:** MongoDB via Prisma 5.x
- **Auth:** NextAuth v5 (Credentials + JWT)
- **State:** Zustand (cart), Recharts (charts), Tailwind CSS v4
- **AI:** Google Gemini (chat tư vấn nước hoa)
- **Images:** Cloudinary

## Development Commands

```bash
# Start with local MongoDB in-memory
npm run dev:local

# Or start MongoDB separately + dev
npx tsx scripts/run-mongo.ts    # Start MongoDB replica set on :27017
npm run dev                      # Start Next.js dev server
npm run db:seed                  # Seed database
npm run build                    # Production build
npm run lint                     # ESLint
```

## Environment Variables (.env)

Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `JWT_SECRET`
Optional: `CLOUDINARY_*`, `GEMINI_API_KEY`

For local dev, use: `DATABASE_URL="mongodb://127.0.0.1:27017/perfume-shop?replicaSet=testset"`

## Project Architecture

```
src/
  auth.ts                    # NextAuth v5 config (Credentials provider)
  lib/prisma.ts              # Singleton Prisma client
  store/cartStore.ts         # Zustand cart with persist
  app/
    admin/                   # Admin pages (products, orders, stats, collections, marketing)
    api/                     # API routes (17 main + 9 marketing = 26 endpoints)
    checkout/                # Checkout flow
    product/[id]/            # Product detail
    shop/                    # Product listing + filters
    login/register/profile/  # Auth pages
    components/              # Reusable UI components
```

## Digital Marketing Module (NEW)

Added June 2026 — full marketing suite for the shop:

### Database Models
- `DiscountCode` — Promo codes (percentage, fixed, free shipping)
- `DiscountUsage` — Code usage tracking
- `Campaign` — Email/SMS/Banner campaigns with metrics
- `CustomerSegment` — Dynamic customer grouping
- `AbandonedCart` — Cart recovery tracking
- `MarketingEvent` — Analytics event tracking (VIEW, ADD_TO_CART, CHECKOUT, PURCHASE)

### API Routes (all under /api/marketing/)
- `discounts/` — CRUD discount codes (admin)
- `discounts/validate/` — Public: validate code at checkout
- `campaigns/` — CRUD campaigns + status management (admin)
- `segments/` — Customer segments with counts (admin)
- `analytics/` — Dashboard data: revenue, funnel, discount performance (admin)
- `events/` — Public: track marketing events
- `abandoned-cart/` — Save/track abandoned carts

### Admin Pages
- `/admin/marketing` — KPI dashboard (revenue, orders, funnel, discount performance)
- `/admin/marketing/discounts` — Discount code management (create, edit, toggle, delete)
- `/admin/marketing/campaigns` — Campaign management (draft → active → paused lifecycle)

### Checkout Integration
- Discount code input + validation at `/checkout`
- Validates: expiry, usage limits, per-user limits, minimum order, product eligibility
- Auto-calculates final total with discount applied
