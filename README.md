# RTW-RTP — Ready to Work, Ready to Play

A production-quality fullstack e-commerce store for computer hardware and gaming equipment, built with Next.js 16, TypeScript, Tailwind CSS v4, Prisma ORM, and NextAuth v5.

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
| Image Uploads | Cloudinary |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Toasts | Sonner |

## Features

- **Product catalog** — filtering, sorting, search, pagination
- **Product detail** — image gallery, specs, reviews, ratings
- **Shopping cart** — persistent via Zustand + localStorage
- **Wishlist & Comparison** — up to 4 products compared side-by-side
- **Authentication** — email/password and Google OAuth
- **Checkout** — shipping info, promo codes, order creation
- **User profile** — edit personal info, view order history
- **Admin dashboard** — stats, product CRUD, order management
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
│   └── api/                  # API routes
├── actions/                  # Server Actions
├── auth.ts                   # NextAuth configuration
├── components/
│   ├── admin/                # Admin-specific components
│   ├── auth/                 # Auth forms
│   ├── home/                 # Homepage sections
│   ├── layout/               # Header, footer, providers
│   ├── product/              # Product card, filters, etc.
│   └── ui/                   # Base UI (Button, Input, Card…)
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   └── utils.ts              # Utility functions
├── store/                    # Zustand stores
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   └── comparison-store.ts
└── types/                    # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted — Neon / Supabase work great)
- Google OAuth credentials (optional for Google sign-in)
- Cloudinary account (optional for image uploads)

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
DATABASE_URL="postgresql://user:password@localhost:5432/rtw_rtp"
AUTH_SECRET="generate-with: openssl rand -base64 32"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

**3. Set up the database**

```bash
# Push the schema to your database
npm run db:push

# Generate the Prisma client
npm run db:generate

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
| `SAVE50` | $50 off orders over $500 |

## Database Commands

```bash
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
| `/orders` | Order history |
| `/admin` | Admin dashboard |
| `/admin/products` | Manage products |
| `/admin/orders` | Manage orders |

## Deployment

This app deploys to Vercel with zero config:

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

For the database, use [Neon](https://neon.tech) for a free serverless PostgreSQL.

