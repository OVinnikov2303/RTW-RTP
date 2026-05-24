# RTW-RTP — Database Architecture

PostgreSQL · Prisma v7 · Port **5433**

---

## Quick Setup

```bash
# 1. Copy and fill in your credentials
cp .env.example .env
# Set DATABASE_URL=postgresql://user:pass@localhost:5433/rtw_rtp

# 2. Push schema and run migration
npm run db:migrate        # creates migration history
# or, for fast dev without migration history:
npm run db:push

# 3. Seed demo data
npm run db:seed

# 4. Open Prisma Studio
npm run db:studio         # → http://localhost:5555
```

---

## Connection String

```
postgresql://<user>:<password>@<host>:5433/<database>?schema=public
```

| Part       | Example value  | Notes                              |
|------------|----------------|------------------------------------|
| `user`     | `postgres`     | Database role with full privileges |
| `password` | `secret`       | URL-encode special characters      |
| `host`     | `localhost`    | Or Docker service name             |
| `5433`     | fixed          | Non-default PostgreSQL port        |
| `database` | `rtw_rtp`      | Created separately before migrate  |

**Create the database first:**
```sql
CREATE DATABASE rtw_rtp;
```

---

## ER Diagram

```
users ─────────────────────────────────────────────────────────────────
  │ 1:N ─── orders ──── 1:N ──── order_items ──── N:1 ─── products
  │ 1:N ─── reviews ─────────────────────────────── N:1 ─┘
  │ 1:N ─── ratings ─────────────────────────────── N:1 ─┘
  │ 1:N ─── wishlist ────────────────────────────── N:1 ─┘
  │ 1:N ─── comparison ─────────────────────────── N:1 ─┘
  │ 1:N ─── cart_items ─────────────────────────── N:1 ─┘
  │ 1:N ─── user_activity ──────────────────────── N:1 ─┘
  │ 1:N ─── admin_logs
  │ 1:N ─── accounts        (OAuth)
  └ 1:N ─── sessions        (JWT / DB sessions)

products ──────────────────────────────────────────────────────────────
  │ N:1 ─── categories ─── N:1 ─── categories (self-ref parent)
  │ 1:N ─── product_images
  │ 1:N ─── product_specs
  │ 1:N ─── product_discounts ─── N:1 ─── discounts
  └ N:M ─── product_compatibility (source ↔ target, same table)

orders ────────────────────────────────────────────────────────────────
  └ N:1 ─── discounts
```

---

## Tables

### `users`
Stores customer and admin accounts. Passwords are bcrypt-hashed (cost 12). OAuth users have no `password`; their identity is stored in `accounts`.

| Column        | Type        | Notes                          |
|---------------|-------------|--------------------------------|
| id            | TEXT (cuid) | Primary key                    |
| name          | TEXT?       |                                |
| email         | TEXT UNIQUE | Login identifier               |
| emailVerified | TIMESTAMP?  | Set after email verification   |
| image         | TEXT?       | Avatar URL                     |
| password      | TEXT?       | bcrypt hash; NULL for OAuth    |
| role          | Role enum   | USER or ADMIN                  |
| phone         | TEXT?       |                                |
| address       | TEXT?       |                                |
| city          | TEXT?       |                                |
| zip           | TEXT?       |                                |
| country       | TEXT?       | ISO 2-letter code              |
| createdAt     | TIMESTAMP   |                                |
| updatedAt     | TIMESTAMP   |                                |

---

### `accounts`
NextAuth OAuth accounts linked to a `users` row. One user can have multiple OAuth providers.

---

### `sessions`
NextAuth database sessions. Each active browser session has one row.

---

### `verification_tokens`
Short-lived tokens for email verification and password reset.

---

### `categories`
Hierarchical product taxonomy. A category can have a `parentId` pointing to another category (one level of nesting used in the app).

| Column      | Type        | Notes                      |
|-------------|-------------|----------------------------|
| parentId    | TEXT?       | Self-referential FK        |
| sortOrder   | INTEGER     | Display order              |
| isActive    | BOOLEAN     |                            |

---

### `products`
Core product entity.

| Column         | Type     | Notes                                          |
|----------------|----------|------------------------------------------------|
| price          | FLOAT    | Current selling price; must be ≥ 0             |
| comparePrice   | FLOAT?   | MSRP / "was" price for showing savings         |
| cost           | FLOAT?   | Internal cost price (hidden from customers)    |
| stock          | INTEGER  | Available inventory; CHECK ≥ 0                 |
| sku            | TEXT?    | Unique warehouse identifier                    |
| tags           | TEXT[]   | PostgreSQL array for quick tag filtering       |
| specifications | JSONB?   | Grouped rich specs (see JSON structure below)  |
| viewCount      | INTEGER  | Incremented on each product page view          |
| purchaseCount  | INTEGER  | Incremented when an order item is created      |
| featured       | BOOLEAN  | Shown on homepage featured section             |
| isNew          | BOOLEAN  | Shown in "New Arrivals"                        |
| isActive       | BOOLEAN  | Soft-delete flag; false = hidden from shop     |

**`specifications` JSON structure (example):**
```jsonc
{
  "Performance": {
    "Processor": "Apple M3 Pro",
    "RAM": "18 GB"
  },
  "Display": {
    "Size": "16.2\"",
    "Refresh Rate": "120 Hz"
  }
}
```
Keys are group names; values are key→value spec objects. This lives alongside the normalized `product_specs` rows (which allow per-spec `group` and `sortOrder`).

---

### `product_images`
One-to-many images per product. Exactly one should have `isPrimary = true`.

---

### `product_specs`
Normalized key/value specification rows. Each row belongs to a `group` (e.g. "Performance") and has a `sortOrder` for display.

---

### `product_compatibility`
Directional compatibility link between two products (e.g. GPU X is compatible with Motherboard Y). The application should query both directions:
```sql
SELECT * FROM product_compatibility
WHERE "sourceId" = $1 OR "targetId" = $1;
```
A `CHECK ("sourceId" <> "targetId")` constraint prevents self-referential links.

---

### `discounts`
Promo codes applied at checkout.

| Column    | Type          | Notes                                      |
|-----------|---------------|--------------------------------------------|
| code      | TEXT UNIQUE   | Case-sensitive; compared uppercased in app |
| type      | DiscountType  | PERCENTAGE or FIXED                        |
| value     | FLOAT         | Percent (0–100) or fixed $ amount          |
| minOrder  | FLOAT?        | Minimum subtotal to apply                  |
| maxUses   | INTEGER?      | NULL = unlimited                           |
| usedCount | INTEGER       | Incremented atomically on order creation   |
| expiresAt | TIMESTAMP?    | NULL = no expiry                           |

---

### `product_discounts`
Join table linking a specific discount code to specific products (optional targeted discounts). Most discounts apply store-wide (unused join table).

---

### `orders`

| Column        | Type          | Notes                                        |
|---------------|---------------|----------------------------------------------|
| status        | OrderStatus   | PENDING → PROCESSING → SHIPPED → DELIVERED   |
| paymentStatus | PaymentStatus | PENDING → PAID; or FAILED / REFUNDED         |
| paymentMethod | TEXT?         | "Credit Card", "PayPal", etc.                |
| paymentRef    | TEXT?         | External payment gateway transaction ID      |
| trackingNumber| TEXT?         | Carrier tracking reference                   |
| shippingZip   | TEXT?         | Added for postal/courier integrations        |
| discountAmount| FLOAT         | Snapshot of savings applied at order time    |

**Order status flow:**
```
PENDING → PROCESSING → SHIPPED → DELIVERED
                 ↓
              CANCELLED
DELIVERED → REFUNDED (partial or full)
```

---

### `order_items`
Immutable snapshot of product + price at time of purchase. `price` is copied from `product.price` so historical orders are not affected by future price changes.

---

### `reviews`
Written reviews with rating (1–5). Only one review per (user, product) pair enforced by unique constraint.

| Column        | Type         | Notes                                         |
|---------------|--------------|-----------------------------------------------|
| rating        | INTEGER      | CHECK 1–5                                     |
| status        | ReviewStatus | PENDING (default) → APPROVED / REJECTED       |
| isVerified    | BOOLEAN      | True if user purchased the product            |
| helpfulCount  | INTEGER      | Upvotes from other users                      |
| moderatedAt   | TIMESTAMP?   | When an admin actioned the review             |
| moderatedById | TEXT?        | FK to the admin user who moderated            |

**Moderation flow:** all reviews start as PENDING and are hidden from the shop until an admin sets status to APPROVED.

---

### `ratings`
Lightweight 1–5 star rating without a written comment. Separate from `reviews` to allow quick ratings. One per (user, product) enforced by unique constraint.

---

### `wishlist`
Per-user saved products. Unique constraint prevents duplicates.

---

### `comparison`
Products queued for side-by-side comparison (typically max 3–4 per user, enforced in application layer).

---

### `cart_items`
Server-persisted cart items for authenticated users. The Zustand store on the client syncs with this table.

---

### `user_activity`
Append-only activity log — never updated after insert. The `data` JSONB field holds event-specific metadata:

| type              | data shape example                          |
|-------------------|---------------------------------------------|
| LOGIN             | `{ method: "email" }`                       |
| VIEW_PRODUCT      | `{ referrer: "/search", timeOnPage: 42 }`   |
| SEARCH            | `{ query: "rtx 4090", results: 5 }`         |
| ADD_TO_CART       | `{ quantity: 1 }`                           |
| PLACE_ORDER       | `{ total: 2499, itemCount: 1 }`             |

---

### `admin_logs`
Immutable audit trail of admin actions. `before`/`after` JSONB fields capture state diffs for auditing.

---

## Indexes

| Table                  | Index columns                    | Purpose                        |
|------------------------|----------------------------------|--------------------------------|
| users                  | email (unique)                   | Login lookup                   |
| users                  | role, createdAt                  | Admin user list                |
| products               | categoryId, brand, price         | Filtered product listing       |
| products               | featured, isNew, isActive        | Homepage / filter flags        |
| products               | viewCount DESC, purchaseCount DESC | Popularity sorting           |
| products               | GIN tsvector(name+description)   | Full-text search               |
| product_images         | productId, isPrimary             | Primary image lookup           |
| orders                 | userId, status, paymentStatus    | User order list + admin filter |
| orders                 | createdAt DESC                   | Recent orders                  |
| reviews                | productId, status, rating        | Approved reviews per product   |
| user_activity          | userId, type, createdAt DESC     | Activity feed                  |
| admin_logs             | adminId, action, createdAt DESC  | Audit query                    |
| admin_logs             | (entityType, entityId)           | Entity audit history           |

---

## Constraints

| Table                  | Constraint                              |
|------------------------|-----------------------------------------|
| products               | price ≥ 0, stock ≥ 0, viewCount ≥ 0    |
| products               | comparePrice ≥ 0 (when set)            |
| discounts              | value > 0, usedCount ≥ 0               |
| orders                 | total ≥ 0, subtotal ≥ 0                |
| order_items            | quantity > 0, price ≥ 0                |
| reviews                | rating BETWEEN 1 AND 5                 |
| ratings                | value BETWEEN 1 AND 5                  |
| cart_items             | quantity > 0                           |
| product_compatibility  | sourceId ≠ targetId                    |

All `ON DELETE CASCADE` — deleting a product removes its images, specs, reviews, etc. Deleting a user removes orders, cart items, and activity logs.

---

## Normalization

The schema is in **Third Normal Form (3NF)** with pragmatic denormalizations:

**1NF** — every attribute is atomic. Array types (`tags TEXT[]`) are a PostgreSQL extension that violates strict 1NF but provides better performance for tag lookups than a junction table.

**2NF** — all non-key attributes depend on the full primary key. Junction tables (`product_discounts`, `product_compatibility`) have composite unique constraints, and each non-key column (`note`, `createdAt`) depends on the full pair.

**3NF** — no transitive dependencies. For example, `orders` stores a snapshot of shipping details rather than referencing a `user.address` field, because order addresses must be immutable.

**Intentional denormalizations:**
- `order_items.price` — snapshot of price at order time (avoids join to get historical price)
- `products.purchaseCount` — derived counter (avoids `COUNT(*)` over `order_items` on every request)
- `products.viewCount` — event counter (avoids expensive `COUNT(*)` over `user_activity`)
- `products.specifications` (JSONB) — duplicates data from `product_specs` rows to enable complex grouped rendering without N+1 queries; both coexist intentionally

---

## Prisma Studio

```bash
npm run db:studio   # → http://localhost:5555
```

Prisma Studio provides a GUI for browsing and editing all tables. Useful for:
- Manually approving reviews (`reviews.status = APPROVED`)
- Activating/deactivating discounts
- Inspecting raw `specifications` JSONB
- Viewing admin audit logs

---

## Migration Instructions

### First-time setup
```bash
# Creates prisma/migrations/ with full SQL and applies it
npm run db:migrate
# → Enter a migration name when prompted, e.g. "init"
```

### After schema changes
```bash
# Prisma detects drift and creates a new migration file
npm run db:migrate
```

### Reset everything (dev only)
```bash
npx prisma migrate reset   # Drops DB, re-applies all migrations, runs seed
```

### Production deploy
```bash
npx prisma migrate deploy  # Applies pending migrations without prompts
```

### Bypass migration (prototyping)
```bash
npm run db:push            # Pushes schema directly without creating migration files
```

---

## Docker Compose (optional)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rtw
      POSTGRES_PASSWORD: rtw_secret
      POSTGRES_DB: rtw_rtp
    ports:
      - "5433:5432"   # host:container — maps 5433 on host to default PG port
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d
# DATABASE_URL=postgresql://rtw:rtw_secret@localhost:5433/rtw_rtp
```
