# Monobank Acquiring — Інструкція з тестування

## Огляд інтеграції

RTW-RTP використовує [Monobank Acquiring API](https://api.monobank.ua) для обробки платежів у гривнях (UAH). Повний платіжний процес:

```
Клієнт → Checkout → POST /api/payments/create → Monobank invoice → Redirect → Monobank payment page
                                                                              ↓ (після оплати)
                                                                        /payment/success
                                                                              ↓
                                                              POST /api/webhooks/monobank (async)
                                                                              ↓
                                                                        DB: paymentStatus = PAID
```

---

## Крок 1 — Отримання токена Monobank

1. Відкрийте [https://api.monobank.ua](https://api.monobank.ua)
2. Натисніть **«Зареєструватись як мерчант»**
3. Авторизуйтесь через мобільний додаток Monobank
4. У розділі **«Тест»** знайдіть ваш токен (рядок виду `u...`)
5. Скопіюйте токен — це ваш `MONOBANK_TOKEN`

> **Тест-режим**: Токени що починаються на `uTest` або видані у секції «Тест» в Monobank порталі — дозволяють виконувати тестові платежі без реальних грошей.

---

## Крок 2 — Налаштування `.env`

Додайте до вашого `.env` файлу:

```env
MONOBANK_TOKEN="uTestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
NEXTAUTH_URL="http://localhost:3000"
```

> `NEXTAUTH_URL` використовується для формування `redirectUrl` та `webHookUrl` при створенні інвойсу.

---

## Крок 3 — Застосування схеми бази даних

```bash
# Застосувати нові таблиці (payment_transactions, payment_status_history, webhook_logs)
npm run db:push

# Додати тестовий товар за 1 ₴
npm run db:seed
```

Нові таблиці:
| Таблиця | Призначення |
|---|---|
| `payment_transactions` | Monobank інвойси + статуси |
| `payment_status_history` | Хронологія зміни статусів |
| `webhook_logs` | Всі вхідні вебхуки від Monobank |

---

## Крок 4 — Налаштування вебхуків (для локальної розробки)

Monobank надсилає POST на `webHookUrl` після зміни статусу платежу. Для локальної розробки потрібен публічний URL.

### Варіант A: ngrok (рекомендовано)

```bash
# Встановіть ngrok: https://ngrok.com/download
ngrok http 3000

# Отримаєте URL виду: https://abc123.ngrok-free.app
# Оновіть NEXTAUTH_URL:
NEXTAUTH_URL="https://abc123.ngrok-free.app"
```

### Варіант B: Localtunnel

```bash
npx localtunnel --port 3000
```

### Варіант C: Vercel Preview (staging)

Задеплойте на Vercel — `NEXTAUTH_URL` автоматично встановлюється з домену деплою.

---

## Крок 5 — Тестовий платіж

### Метод 1: Через тестовий товар за 1 ₴

1. Запустіть dev-сервер: `npm run dev`
2. Відкрийте [http://localhost:3000/products/rtw-rtp-test-payment-product](http://localhost:3000/products/rtw-rtp-test-payment-product)
3. Натисніть **«Додати до кошика»**
4. Перейдіть до кошика → Оформлення
5. Заповніть форму доставки
6. Натисніть **«Оплатити через Monobank»**
7. Вас перенаправлять на сторінку оплати Monobank

### На сторінці оплати Monobank (тест-режим):

| Сценарій | Дія |
|---|---|
| Успішна оплата | Введіть тестові дані картки або натисніть «Оплатити» |
| Відхилена оплата | Оберіть «Відмовити» або введіть невірні дані |

### Тестові картки Monobank:

```
Номер:  4111 1111 1111 1111
Дата:   12/30
CVV:    123
```

---

## Крок 6 — Перевірка результатів

### Після успішного платежу:
1. Вас перенаправить на `/payment/success?orderId=xxx`
2. Сторінка автоматично оновить статус (polling кожні 3 сек)
3. Перевірте статус замовлення в `/orders`
4. Адмін: перевірте `/admin/payments`

### Перевірка в базі даних:
```sql
-- Транзакції
SELECT * FROM payment_transactions ORDER BY created_at DESC LIMIT 5;

-- Хронологія статусів
SELECT psh.*, pt.invoice_id 
FROM payment_status_history psh
JOIN payment_transactions pt ON pt.id = psh.transaction_id
ORDER BY psh.created_at DESC LIMIT 10;

-- Вебхуки
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 10;
```

### Через Prisma Studio:
```bash
npm run db:studio
# Відкрийте: http://localhost:5555
```

---

## Статуси платежів

### Статуси Monobank (`PaymentTransaction.status`):
| Статус | Значення |
|---|---|
| `created` | Інвойс створено, очікує оплати |
| `processing` | Платіж обробляється |
| `hold` | Кошти заблоковані (pre-auth) |
| `success` | Оплата успішна ✅ |
| `failure` | Оплата відхилена ❌ |
| `reversed` | Платіж повернено 🔄 |
| `expired` | Інвойс прострочено (15 хв) ⏱ |

### Статуси в нашій БД (`Order.paymentStatus`):
| Наш статус | Mono статус |
|---|---|
| `PENDING` | created / processing / hold |
| `PAID` | success |
| `FAILED` | failure |
| `REFUNDED` | reversed |
| `CANCELLED` | expired |

---

## API Endpoints

### `POST /api/payments/create`
Створює замовлення в БД та інвойс в Monobank.

**Request body:**
```json
{
  "items": [
    {
      "product": { "id": "...", "name": "...", "price": 1, "stock": 9999 },
      "quantity": 1
    }
  ],
  "shippingName": "Іван Іваненко",
  "shippingEmail": "ivan@example.com",
  "shippingPhone": "+380501234567",
  "shippingAddress": "вул. Хрещатик, 1",
  "shippingCity": "Київ",
  "shippingCountry": "Україна",
  "discountCode": "WELCOME10"
}
```

**Response:**
```json
{
  "paymentUrl": "https://pay.monobank.ua/invoice/p2_XXXXXXXX",
  "orderId": "clxxxxxxxxxxxxxxxx"
}
```

### `GET /api/payments/status?orderId={id}`
Повертає поточний статус платежу (отримує дані з Monobank API).

**Response:**
```json
{
  "invoiceId": "p2_XXXXXXXX",
  "orderId": "clxxxxxxxxxxxxxxxx",
  "status": "success",
  "paymentStatus": "PAID",
  "orderStatus": "PROCESSING",
  "amount": 1.00
}
```

### `POST /api/webhooks/monobank`
Отримує статусні оновлення від Monobank. Верифікує підпис RSA-SHA256.

**Webhook payload (від Monobank):**
```json
{
  "invoiceId": "p2_XXXXXXXX",
  "status": "success",
  "amount": 100,
  "ccy": 980,
  "reference": "clxxxxxxxxxxxxxxxx",
  "createdDate": 1700000000,
  "modifiedDate": 1700000060,
  "paymentInfo": {
    "maskedPan": "537541******4404",
    "approvalCode": "123456",
    "bank": "Monobank",
    "paymentSystem": "Visa"
  }
}
```

---

## Troubleshooting

### Помилка `MONOBANK_TOKEN is not set`
Перевірте, що `MONOBANK_TOKEN` є у вашому `.env` файлі та перезапустіть сервер.

### Вебхук не надходить (локальна розробка)
- Переконайтеся, що `NEXTAUTH_URL` вказує на публічний URL (ngrok/localtunnel)
- Перевірте `webhook_logs` в БД — там будуть спроби доставки

### Невірний підпис вебхука
- В режимі `development` перевірка підпису автоматично пропускається (якщо `X-Sign` відсутній)
- В `production` підпис завжди перевіряється через публічний ключ Monobank

### Помилка `502` при створенні платежу
- Перевірте валідність `MONOBANK_TOKEN`
- Перевірте доступність `api.monobank.ua` з вашого сервера
- Подивіться логи сервера Next.js

### Сума менше 1 копійки
Monobank вимагає мінімальну суму 1 копійка (0.01 UAH). При `total = 0` (наприклад, 100% знижка) API автоматично встановлює `0.01 UAH`.

---

## Безпека

- Токен `MONOBANK_TOKEN` зберігається лише на сервері, ніколи не передається клієнту
- Вебхуки верифікуються підписом RSA-SHA256 від Monobank
- Публічний ключ Monobank кешується в пам'яті сервера (оновлюється при рестарті)
- Усі платіжні запити вимагають авторизованого сесії

---

## Адмін-панель

Перейдіть до `/admin/payments` для:
- Перегляду всіх транзакцій
- Відстеження успішних/невдалих платежів
- Моніторингу вебхуків
- Аналітики доходу

> Доступ лише для користувачів з роллю `ADMIN`.
