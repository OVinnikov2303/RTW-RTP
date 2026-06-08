# RTW-RTP — Ready to Work, Ready to Play

A fullstack e-commerce store for computer hardware and gaming equipment, built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma ORM, and NextAuth v5. The UI is fully in Ukrainian (`lang="uk"`). Live at [rtw-rtp.vercel.app](https://rtw-rtp.vercel.app).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | Custom shadcn-style (Radix UI) |
| Database ORM | Prisma v7 + PostgreSQL |
| Authentication | NextAuth v5 (Email + Google OAuth) |
| State Management | Zustand v5 |
| Image Uploads | Cloudinary (with URL-based fallback when not configured) |
| Payments | Monobank Acquiring |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Toasts | Sonner |

## Features

- **Product catalog** — filtering, sorting, search, pagination
- **Product detail** — image gallery, specs, reviews, ratings
- **Shopping cart** — persistent via Zustand + localStorage
- **Wishlist & Comparison** — up to 4 products compared side-by-side
- **Authentication** — email/password and Google OAuth
- **Checkout & payments** — shipping info, promo codes, order creation, Monobank Acquiring checkout
- **Product reviews** — ratings, sign-in prompt for guests, authors (and admins) can delete their own reviews
- **User profile** — edit personal info, view order history
- **Admin dashboard** — stats, product CRUD (with Cloudinary upload widget or URL fallback), order & payment management
- **Dark / Light mode** — system-aware, toggleable
- **Fully responsive** — mobile-first design

## Project Structure

```
src/
├── app/
│   ├── (admin)/admin/        # Admin pages (protected)
│   ├── (auth)/               # Sign in / Sign up
│   ├── (shop)/               # Store pages
│   ├── (user)/               # Profile & orders (protected)
│   └── api/                  # API routes (payments, webhooks, auth)
├── actions/                  # Server Actions (all data mutations)
├── auth.ts                   # NextAuth configuration
├── components/
│   ├── admin/                # Admin-specific components
│   ├── auth/                 # Auth forms
│   ├── home/                 # Homepage sections
│   ├── layout/               # Header, footer, providers
│   ├── product/              # Product card, filters, etc.
│   └── ui/                   # Base UI (Button, Input, Card…)
├── lib/
│   ├── prisma.ts             # Prisma client singleton (PrismaPg adapter)
│   ├── monobank.ts           # Monobank Acquiring client + webhook verification
│   └── utils.ts              # Utility functions
├── store/                    # Zustand stores
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   └── comparison-store.ts
└── types/                    # TypeScript types
```

> **Note (Prisma v7):** the database `url` is no longer set in `schema.prisma`. It lives in [`prisma.config.ts`](prisma.config.ts) via `defineConfig` + `@prisma/adapter-pg`, and `src/lib/prisma.ts` builds the client with the `PrismaPg` adapter.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted — this project uses [Neon](https://neon.tech))
- Google OAuth credentials (optional for Google sign-in)
- Cloudinary account (optional for image uploads — without it, the admin form falls back to URL-based image input)
- Monobank Acquiring merchant token (optional, for checkout payments — sandbox tokens work for testing)

### Installation

**1. Clone and install dependencies**

```bash
git clone <your-repo>
cd RTW-RTP
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5433/rtw_rtp?schema=public"
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
MONOBANK_TOKEN="your-monobank-merchant-token"
```

See [`.env.example`](.env.example) for the full annotated list.

**3. Set up the database**

```bash
# Generate the Prisma client
npm run db:generate

# Push the schema to your database
npm run db:push

# Seed with sample data
npm run db:seed
```

**4. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@rtw-rtp.com | admin123 |
| User | user@rtw-rtp.com | user1234 |

### Promo Codes (after seeding)

| Code | Discount |
|---|---|
| `WELCOME10` | 10% off any order |
| `SAVE50` | 50₴ off orders over 500₴ |
| `SUMMER25` | 25% off any order |

There's also a 1₴ test product at `/products/rtw-rtp-test-payment-product` for exercising the Monobank checkout flow end-to-end.

## Commands

```bash
npm run dev           # Start the dev server
npm run build         # Production build (runs prisma generate first)
npm run start         # Start the production server
npm run lint          # Run ESLint
npx tsc --noEmit      # Type check

npm run db:generate   # Regenerate Prisma client
npm run db:push       # Sync schema to DB (no migration files)
npm run db:migrate    # Create + apply a migration
npm run db:seed       # Seed sample data
npm run db:studio     # Open Prisma Studio
```

## Pages

| Route | Description |
|---|---|
| `/` | Home page |
| `/products` | Product catalog |
| `/products/[slug]` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/wishlist` | Wishlist |
| `/compare` | Product comparison |
| `/about` | About us |
| `/contacts` | Contact |
| `/sign-in` | Sign in |
| `/sign-up` | Sign up |
| `/profile` | User profile |
| `/orders` / `/orders/[id]` | Order history & details |
| `/payment/success` / `/payment/failure` | Post-checkout payment status |
| `/admin` | Admin dashboard |
| `/admin/products` | Manage products |
| `/admin/orders` | Manage orders |
| `/admin/payments` | Manage payments |

## Deployment

Deployed on Vercel at [rtw-rtp.vercel.app](https://rtw-rtp.vercel.app), backed by a Neon PostgreSQL database:

1. Push to GitHub
2. Import in Vercel
3. Add environment variables (see `.env.example`) via `vercel env` or the dashboard
4. `vercel --prod`

To push the schema and seed a remote database directly:

```bash
npx prisma db push --url "<connection-string>"
DATABASE_URL="<connection-string>" npx tsx prisma/seed.ts
```

