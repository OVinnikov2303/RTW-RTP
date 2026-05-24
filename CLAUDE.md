@AGENTS.md

# RTW-RTP — Project Context for Claude Code

## What this project is
Fullstack e-commerce store for computer hardware and gaming equipment.
**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma v7 + PostgreSQL, NextAuth v5 beta, Zustand v5, Sonner, shadcn-style Radix UI components.

## Key architecture decisions
- Route groups: `(shop)`, `(auth)`, `(user)`, `(admin)` each with own layout
- Server Actions in `src/actions/` for all data mutations (no REST for mutations)
- `src/auth.ts` — NextAuth v5 config (email + Google OAuth)
- **Prisma v7 breaking change**: `url` removed from `schema.prisma` → lives in `prisma.config.ts` using `defineConfig` from `prisma/config` + `@prisma/adapter-pg`
- `src/lib/prisma.ts` — Prisma client uses `PrismaPg` adapter, NOT `DATABASE_URL` in schema
- Session `role` field extended via `src/types/next-auth.d.ts`
- `ThemeProvider` (next-themes) is in `src/app/layout.tsx` (server component), NOT in `providers.tsx` — avoids React 19 script-tag warning
- All DB-querying server pages have `export const dynamic = "force-dynamic"`

## Current state (as of last session)
- ✅ All pages built and TypeScript clean (0 errors)
- ✅ Production build passes
- ✅ Entire UI translated to Ukrainian (45 files) — all user-facing text is in Ukrainian
- ✅ `lang="uk"` set on `<html>`, `suppressHydrationWarning` on `<html>` and `<body>`
- ✅ `.env` has real `DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- ✅ Google OAuth credentials created (Web application, redirect URI: http://localhost:3000/api/auth/callback/google)
- ✅ Database is set up (db:push + db:seed already run)
- ⚠️  Google OAuth: app is in "Testing" mode — user's Google email must be added to Test Users in Google Cloud Console → Audience → Test users

## Google OAuth setup (done)
- Project: "My First Project" in Google Cloud Console
- Client ID: 750125203210-qluoo96ehhs74poeh7l0c80uest93kt9.apps.googleusercontent.com
- Redirect URI configured: http://localhost:3000/api/auth/callback/google
- Auth vars in .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (NOT AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET)
- To allow login: Google Cloud Console → Audience → Test users → Add your Google email

## Commands
```bash
npm run dev          # Start dev server
npm run db:push      # Sync schema to DB
npm run db:seed      # Seed sample data (creates test users + products)
npm run db:studio    # Open Prisma Studio
npx tsc --noEmit     # Type check
npm run build        # Production build
```

## Test accounts (after seeding)
- Admin: admin@rtw-rtp.com / admin123
- User:  user@rtw-rtp.com / user1234
- Promo codes: WELCOME10 (10%), SAVE50 ($50 off orders $500+)

## Pages built
/, /products, /products/[slug], /cart, /checkout, /wishlist, /compare,
/about, /contacts, /sign-in, /sign-up, /profile, /orders,
/admin, /admin/products, /admin/products/new, /admin/products/[id]/edit, /admin/orders

