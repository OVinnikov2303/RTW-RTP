# RTW-RTP — Ready to Work, Ready to Play

Фулстек інтернет-магазин компʼютерної техніки та ігрового обладнання, побудований на Next.js 16, TypeScript, Tailwind CSS v4, Prisma ORM та NextAuth v5. Інтерфейс повністю українською (`lang="uk"`). Працює на [rtw-rtp.vercel.app](https://rtw-rtp.vercel.app).

## Технологічний стек

| Шар | Технологія |
|---|---|
| Фреймворк | Next.js 16 (App Router) |
| Мова | TypeScript |
| Стилізація | Tailwind CSS v4 |
| UI-компоненти | Власні shadcn-style (Radix UI) |
| ORM бази даних | Prisma v7 + PostgreSQL |
| Автентифікація | NextAuth v5 (Email + Google OAuth) |
| Керування станом | Zustand v5 |
| Завантаження зображень | Cloudinary (з резервним варіантом через URL, якщо не налаштовано) |
| Платежі | Monobank Acquiring |
| Форми | React Hook Form + Zod |
| Анімації | Framer Motion |
| Сповіщення | Sonner |

## Можливості

- **Каталог товарів** — фільтрація, сортування, пошук, пагінація
- **Сторінка товару** — галерея зображень, характеристики, відгуки, рейтинги
- **Кошик** — зберігається через Zustand + localStorage
- **Список бажань і порівняння** — порівняння до 4 товарів одночасно
- **Автентифікація** — email/пароль та Google OAuth
- **Оформлення замовлення та оплата** — дані доставки, промокоди, створення замовлення, оплата через Monobank Acquiring
- **Відгуки на товари** — рейтинги, пропозиція увійти для гостей, автори (та адміни) можуть видаляти свої відгуки
- **Профіль користувача** — редагування особистих даних, перегляд історії замовлень
- **Адмін-панель** — статистика, CRUD товарів (з віджетом завантаження Cloudinary або через URL), керування замовленнями та платежами
- **Темна / світла тема** — врахування системних налаштувань, перемикання вручну
- **Повністю адаптивний дизайн** — mobile-first

## Структура проєкту

```
src/
├── app/
│   ├── (admin)/admin/        # Сторінки адмінки (захищені)
│   ├── (auth)/               # Вхід / Реєстрація
│   ├── (shop)/               # Сторінки магазину
│   ├── (user)/               # Профіль і замовлення (захищені)
│   └── api/                  # API-маршрути (платежі, вебхуки, авторизація)
├── actions/                  # Server Actions (усі мутації даних)
├── auth.ts                   # Конфігурація NextAuth
├── components/
│   ├── admin/                # Компоненти адмінки
│   ├── auth/                 # Форми авторизації
│   ├── home/                 # Секції головної сторінки
│   ├── layout/               # Header, footer, провайдери
│   ├── product/              # Картка товару, фільтри тощо
│   └── ui/                   # Базові UI-компоненти (Button, Input, Card…)
├── lib/
│   ├── prisma.ts             # Singleton клієнта Prisma (адаптер PrismaPg)
│   ├── monobank.ts           # Клієнт Monobank Acquiring + перевірка вебхуків
│   └── utils.ts              # Допоміжні функції
├── store/                    # Zustand-сховища
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   └── comparison-store.ts
└── types/                    # TypeScript-типи
```

> **Примітка (Prisma v7):** `url` бази даних більше не задається в `schema.prisma`. Тепер він живе в [`prisma.config.ts`](prisma.config.ts) через `defineConfig` + `@prisma/adapter-pg`, а `src/lib/prisma.ts` створює клієнт з адаптером `PrismaPg`.

## Початок роботи

### Передумови

- Node.js 20+
- База даних PostgreSQL (локальна або хмарна — у цьому проєкті використовується [Neon](https://neon.tech))
- Дані Google OAuth (опційно, для входу через Google)
- Акаунт Cloudinary (опційно, для завантаження зображень — без нього форма адмінки використовує введення зображення через URL)
- Токен мерчанта Monobank Acquiring (опційно, для оплати — для тестування підходять sandbox-токени)

### Встановлення

**1. Клонування та встановлення залежностей**

```bash
git clone <your-repo>
cd RTW-RTP
npm install
```

**2. Налаштування змінних середовища**

```bash
cp .env.example .env
```

Відредагуйте `.env`, вказавши свої значення:

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

Повний анотований список змінних — у [`.env.example`](.env.example).

**3. Налаштування бази даних**

```bash
# Згенерувати клієнт Prisma
npm run db:generate

# Накатити схему на базу даних
npm run db:push

# Заповнити тестовими даними
npm run db:seed
```

**4. Запуск сервера розробки**

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000).

### Тестові акаунти (після сидінгу)

| Роль | Email | Пароль |
|---|---|---|
| Адмін | admin@rtw-rtp.com | admin123 |
| Користувач | user@rtw-rtp.com | user1234 |

### Промокоди (після сидінгу)

| Код | Знижка |
|---|---|
| `WELCOME10` | 10% на будь-яке замовлення |
| `SAVE50` | 50₴ знижки на замовлення від 500₴ |
| `SUMMER25` | 25% на будь-яке замовлення |

Також є тестовий товар за 1₴ на `/products/rtw-rtp-test-payment-product` — для перевірки повного циклу оплати через Monobank.

## Команди

```bash
npm run dev           # Запустити сервер розробки
npm run build         # Продакшн-збірка (спочатку виконує prisma generate)
npm run start         # Запустити продакшн-сервер
npm run lint          # Запустити ESLint
npx tsc --noEmit      # Перевірка типів

npm run db:generate   # Перегенерувати клієнт Prisma
npm run db:push       # Синхронізувати схему з БД (без файлів міграцій)
npm run db:migrate    # Створити та застосувати міграцію
npm run db:seed       # Заповнити тестовими даними
npm run db:studio     # Відкрити Prisma Studio
```

## Сторінки

| Маршрут | Опис |
|---|---|
| `/` | Головна сторінка |
| `/products` | Каталог товарів |
| `/products/[slug]` | Сторінка товару |
| `/cart` | Кошик |
| `/checkout` | Оформлення замовлення |
| `/wishlist` | Список бажань |
| `/compare` | Порівняння товарів |
| `/about` | Про нас |
| `/contacts` | Контакти |
| `/sign-in` | Вхід |
| `/sign-up` | Реєстрація |
| `/profile` | Профіль користувача |
| `/orders` / `/orders/[id]` | Історія та деталі замовлень |
| `/payment/success` / `/payment/failure` | Статус оплати після оформлення |
| `/admin` | Адмін-панель |
| `/admin/products` | Керування товарами |
| `/admin/orders` | Керування замовленнями |
| `/admin/payments` | Керування платежами |

## Деплой

Розгорнуто на Vercel за адресою [rtw-rtp.vercel.app](https://rtw-rtp.vercel.app), база даних — Neon PostgreSQL:

1. Запушити в GitHub
2. Імпортувати в Vercel
3. Додати змінні середовища (див. `.env.example`) через `vercel env` або панель керування
4. `vercel --prod`

Щоб накатити схему та засіяти віддалену базу даних напряму:

```bash
npx prisma db push --url "<connection-string>"
DATABASE_URL="<connection-string>" npx tsx prisma/seed.ts
```
