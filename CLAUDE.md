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

## Current state
- ✅ All pages built and TypeScript clean (0 errors)
- ✅ Production build passes — deployed at https://rtw-rtp.vercel.app
- ✅ Entire UI in Ukrainian (45 files), `lang="uk"` on `<html>`
- ✅ Monobank Acquiring integrated — real webhook verification (RSA PEM key), test token active
- ✅ Neon PostgreSQL (cloud) — schema pushed, seed data loaded
- ✅ Admin product form has Cloudinary upload widget (shows warning banner if not configured)
- ⚠️  Cloudinary NOT configured yet — see setup below
- ⚠️  Google OAuth in "Testing" mode — add Google email to Test Users in Google Cloud Console

## Deployment (Vercel + Neon)
- Production URL: https://rtw-rtp.vercel.app
- GitHub repo: https://github.com/OVinnikov2303/RTW-RTP
- Database: Neon PostgreSQL (ep-weathered-smoke-alfd1s3l.c-3.eu-central-1.aws.neon.tech)
- To push schema to Neon: `npx prisma db push --url "neon-url"`
- To seed Neon: `DATABASE_URL="neon-url" npx tsx prisma/seed.ts`
- Vercel env vars managed via `vercel env` CLI (already linked: `vercel link`)

## Cloudinary — налаштування фото товарів
Cloudinary зберігає і роздає фото. Безкоштовний план: 25 GB + 25 GB трафіку/місяць.

### Кроки налаштування (один раз):
1. Зареєструйся на https://cloudinary.com (безкоштовно, без карти)
2. На Dashboard скопіюй **Cloud Name** (вгорі ліворуч, напр. `dxyz123abc`)
3. Settings → **Upload** → вкладка "Upload presets" → **Add upload preset**
   - Preset name: `rtw-rtp-products`
   - Signing mode: **Unsigned** (обов'язково!)
   - Folder: `rtw-rtp/products`
   - Збережи
4. Додай змінні в `.env`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxyz123abc"   # твій Cloud Name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="rtw-rtp-products"
   CLOUDINARY_API_KEY="111111111111111"              # Settings → API Keys
   CLOUDINARY_API_SECRET="xxxxxxxxxxxxxxxx"          # Settings → API Keys
   ```
5. Додай ці ж змінні на **Vercel**:
   ```bash
   echo "dxyz123abc" | vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production
   echo "rtw-rtp-products" | vercel env add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET production
   echo "111111111111111" | vercel env add CLOUDINARY_API_KEY production
   echo "xxxxxxxx" | vercel env add CLOUDINARY_API_SECRET production
   vercel --prod
   ```

### Як завантажувати фото товарів:
- Відкрий https://rtw-rtp.vercel.app/admin/products/new (або /edit)
- Натисни **"Завантажити фото"** → відкриється Cloudinary Upload Widget
- Перетягни або вибери файли (jpg/png/webp, до 10 МБ)
- Можна завантажити кілька фото одразу
- Перше фото автоматично стає головним (значок "Головне")
- Щоб змінити головне — наведи на фото → натисни "Головне"
- Щоб видалити — наведи → кнопка X

### Поточний стан без Cloudinary:
Якщо Cloudinary не налаштовано — форма показує жовте попередження. Фото все одно можна додати через URL (вставити посилання на зображення з інтернету).

## Google OAuth setup
- Project: "My First Project" in Google Cloud Console
- Client ID: 750125203210-qluoo96ehhs74poeh7l0c80uest93kt9.apps.googleusercontent.com
- Redirect URIs: http://localhost:3000/api/auth/callback/google + https://rtw-rtp.vercel.app/api/auth/callback/google
- Auth vars in .env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- To allow login: Google Cloud Console → Audience → Test users → Add your Google email

## Monobank Acquiring
- Test token active (usp-...) — payments work in sandbox, no real money moves
- Webhook URL: https://rtw-rtp.vercel.app/api/webhooks/monobank
- Webhook signature: ECDSA, Monobank returns base64-encoded PEM key (NOT DER) — fixed in src/lib/monobank.ts
- For real payments: register FOP via Дія app → Monobank Business → get production token → replace MONOBANK_TOKEN on Vercel

## Commands
```bash
npm run dev          # Start dev server
npm run db:push      # Sync schema to local DB
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
npx tsc --noEmit     # Type check
npm run build        # Production build
vercel --prod        # Deploy to production
vercel logs rtw-rtp.vercel.app --limit 30   # View production logs
```

## Test accounts (after seeding)
- Admin: admin@rtw-rtp.com / admin123
- User:  user@rtw-rtp.com / user1234
- Promo codes: WELCOME10 (10%), SAVE50 (50₴ знижки від 500₴), SUMMER25 (25%)
- Test product: /products/rtw-rtp-test-payment-product (1 ₴)

## Pages built
/, /products, /products/[slug], /cart, /checkout, /wishlist, /compare,
/about, /contacts, /sign-in, /sign-up, /profile, /orders, /orders/[id],
/payment/success, /payment/failure,
/admin, /admin/products, /admin/products/new, /admin/products/[id]/edit,
/admin/orders, /admin/payments
