-- ─────────────────────────────────────────────────────────────────────────────
-- RTW-RTP  –  Initial Database Migration
-- Generated for PostgreSQL (port 5433)
-- Run via: npm run db:migrate
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enum types ────────────────────────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

CREATE TYPE "OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);

CREATE TYPE "PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);

CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "ActivityType" AS ENUM (
    'VIEW_PRODUCT',
    'SEARCH',
    'ADD_TO_CART',
    'REMOVE_FROM_CART',
    'ADD_TO_WISHLIST',
    'REMOVE_FROM_WISHLIST',
    'PLACE_ORDER',
    'WRITE_REVIEW',
    'LOGIN',
    'LOGOUT',
    'UPDATE_PROFILE'
);

CREATE TYPE "AdminActionType" AS ENUM (
    'CREATE_PRODUCT',
    'UPDATE_PRODUCT',
    'DELETE_PRODUCT',
    'CREATE_CATEGORY',
    'UPDATE_CATEGORY',
    'DELETE_CATEGORY',
    'UPDATE_ORDER_STATUS',
    'CREATE_DISCOUNT',
    'UPDATE_DISCOUNT',
    'DELETE_DISCOUNT',
    'APPROVE_REVIEW',
    'REJECT_REVIEW',
    'UPDATE_USER_ROLE',
    'VIEW_DASHBOARD'
);

-- ── users ─────────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
    "id"            TEXT            NOT NULL,
    "name"          TEXT,
    "email"         TEXT            NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image"         TEXT,
    "password"      TEXT,
    "role"          "Role"          NOT NULL DEFAULT 'USER',
    "phone"         TEXT,
    "address"       TEXT,
    "city"          TEXT,
    "zip"           TEXT,
    "country"       TEXT,
    "createdAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)    NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key"    ON "users"("email");
CREATE        INDEX "users_role_idx"     ON "users"("role");
CREATE        INDEX "users_createdAt_idx" ON "users"("createdAt");

-- ── accounts ──────────────────────────────────────────────────────────────────

CREATE TABLE "accounts" (
    "id"                TEXT    NOT NULL,
    "userId"            TEXT    NOT NULL,
    "type"              TEXT    NOT NULL,
    "provider"          TEXT    NOT NULL,
    "providerAccountId" TEXT    NOT NULL,
    "refresh_token"     TEXT,
    "access_token"      TEXT,
    "expires_at"        INTEGER,
    "token_type"        TEXT,
    "scope"             TEXT,
    "id_token"          TEXT,
    "session_state"     TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "accounts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key"
    ON "accounts"("provider", "providerAccountId");
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- ── sessions ──────────────────────────────────────────────────────────────────

CREATE TABLE "sessions" (
    "id"           TEXT         NOT NULL,
    "sessionToken" TEXT         NOT NULL,
    "userId"       TEXT         NOT NULL,
    "expires"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sessions_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE        INDEX "sessions_userId_idx"        ON "sessions"("userId");
CREATE        INDEX "sessions_expires_idx"       ON "sessions"("expires");

-- ── verification_tokens ───────────────────────────────────────────────────────

CREATE TABLE "verification_tokens" (
    "identifier" TEXT         NOT NULL,
    "token"      TEXT         NOT NULL,
    "expires"    TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "verification_tokens_identifier_token_key"
    ON "verification_tokens"("identifier", "token");
CREATE INDEX "verification_tokens_expires_idx" ON "verification_tokens"("expires");

-- ── categories ────────────────────────────────────────────────────────────────

CREATE TABLE "categories" (
    "id"          TEXT         NOT NULL,
    "name"        TEXT         NOT NULL,
    "slug"        TEXT         NOT NULL,
    "description" TEXT,
    "image"       TEXT,
    "parentId"    TEXT,
    "sortOrder"   INTEGER      NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN      NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "categories"("id")
);

CREATE UNIQUE INDEX "categories_name_key"     ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key"     ON "categories"("slug");
CREATE        INDEX "categories_parentId_idx" ON "categories"("parentId");
CREATE        INDEX "categories_isActive_idx" ON "categories"("isActive");

-- ── products ──────────────────────────────────────────────────────────────────

CREATE TABLE "products" (
    "id"             TEXT         NOT NULL,
    "name"           TEXT         NOT NULL,
    "slug"           TEXT         NOT NULL,
    "description"    TEXT         NOT NULL,
    "price"          DOUBLE PRECISION NOT NULL,
    "comparePrice"   DOUBLE PRECISION,
    "cost"           DOUBLE PRECISION,
    "stock"          INTEGER      NOT NULL DEFAULT 0,
    "sku"            TEXT,
    "brand"          TEXT,
    "weight"         DOUBLE PRECISION,
    "dimensions"     TEXT,
    "tags"           TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
    "specifications" JSONB,
    "featured"       BOOLEAN      NOT NULL DEFAULT false,
    "isNew"          BOOLEAN      NOT NULL DEFAULT false,
    "isActive"       BOOLEAN      NOT NULL DEFAULT true,
    "viewCount"      INTEGER      NOT NULL DEFAULT 0,
    "purchaseCount"  INTEGER      NOT NULL DEFAULT 0,
    "categoryId"     TEXT         NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey"       PRIMARY KEY ("id"),
    CONSTRAINT "products_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "categories"("id"),
    CONSTRAINT "products_stock_check"        CHECK ("stock" >= 0),
    CONSTRAINT "products_price_check"        CHECK ("price" >= 0),
    CONSTRAINT "products_comparePrice_check" CHECK ("comparePrice" IS NULL OR "comparePrice" >= 0),
    CONSTRAINT "products_cost_check"         CHECK ("cost" IS NULL OR "cost" >= 0),
    CONSTRAINT "products_viewCount_check"    CHECK ("viewCount" >= 0),
    CONSTRAINT "products_purchaseCount_check" CHECK ("purchaseCount" >= 0)
);

CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "products_sku_key"  ON "products"("sku") WHERE "sku" IS NOT NULL;
CREATE        INDEX "products_categoryId_idx"    ON "products"("categoryId");
CREATE        INDEX "products_brand_idx"         ON "products"("brand");
CREATE        INDEX "products_featured_idx"      ON "products"("featured");
CREATE        INDEX "products_isNew_idx"         ON "products"("isNew");
CREATE        INDEX "products_isActive_idx"      ON "products"("isActive");
CREATE        INDEX "products_price_idx"         ON "products"("price");
CREATE        INDEX "products_viewCount_idx"     ON "products"("viewCount" DESC);
CREATE        INDEX "products_purchaseCount_idx" ON "products"("purchaseCount" DESC);
CREATE        INDEX "products_createdAt_idx"     ON "products"("createdAt" DESC);
-- Full-text search index on name + description
CREATE INDEX "products_fts_idx" ON "products"
    USING GIN (to_tsvector('english', "name" || ' ' || "description"));

-- ── product_images ────────────────────────────────────────────────────────────

CREATE TABLE "product_images" (
    "id"        TEXT         NOT NULL,
    "url"       TEXT         NOT NULL,
    "publicId"  TEXT,
    "alt"       TEXT,
    "sortOrder" INTEGER      NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN      NOT NULL DEFAULT false,
    "productId" TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_images_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");
CREATE INDEX "product_images_isPrimary_idx" ON "product_images"("isPrimary");

-- ── product_specs ─────────────────────────────────────────────────────────────

CREATE TABLE "product_specs" (
    "id"        TEXT    NOT NULL,
    "key"       TEXT    NOT NULL,
    "value"     TEXT    NOT NULL,
    "group"     TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT    NOT NULL,

    CONSTRAINT "product_specs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_specs_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE INDEX "product_specs_productId_idx" ON "product_specs"("productId");

-- ── product_compatibility ─────────────────────────────────────────────────────

CREATE TABLE "product_compatibility" (
    "id"        TEXT         NOT NULL,
    "sourceId"  TEXT         NOT NULL,
    "targetId"  TEXT         NOT NULL,
    "note"      TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_compatibility_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_compatibility_sourceId_fkey"
        FOREIGN KEY ("sourceId") REFERENCES "products"("id") ON DELETE CASCADE,
    CONSTRAINT "product_compatibility_targetId_fkey"
        FOREIGN KEY ("targetId") REFERENCES "products"("id") ON DELETE CASCADE,
    CONSTRAINT "product_compatibility_no_self_ref" CHECK ("sourceId" <> "targetId")
);

CREATE UNIQUE INDEX "product_compatibility_sourceId_targetId_key"
    ON "product_compatibility"("sourceId", "targetId");
CREATE INDEX "product_compatibility_sourceId_idx" ON "product_compatibility"("sourceId");
CREATE INDEX "product_compatibility_targetId_idx" ON "product_compatibility"("targetId");

-- ── discounts ─────────────────────────────────────────────────────────────────

CREATE TABLE "discounts" (
    "id"          TEXT             NOT NULL,
    "code"        TEXT             NOT NULL,
    "description" TEXT,
    "type"        "DiscountType"   NOT NULL,
    "value"       DOUBLE PRECISION NOT NULL,
    "minOrder"    DOUBLE PRECISION,
    "maxUses"     INTEGER,
    "usedCount"   INTEGER          NOT NULL DEFAULT 0,
    "isActive"    BOOLEAN          NOT NULL DEFAULT true,
    "expiresAt"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "discounts_pkey"            PRIMARY KEY ("id"),
    CONSTRAINT "discounts_value_check"     CHECK ("value" > 0),
    CONSTRAINT "discounts_usedCount_check" CHECK ("usedCount" >= 0),
    CONSTRAINT "discounts_maxUses_check"   CHECK ("maxUses" IS NULL OR "maxUses" > 0)
);

CREATE UNIQUE INDEX "discounts_code_key"    ON "discounts"("code");
CREATE        INDEX "discounts_isActive_idx" ON "discounts"("isActive");
CREATE        INDEX "discounts_expiresAt_idx" ON "discounts"("expiresAt");

-- ── product_discounts ─────────────────────────────────────────────────────────

CREATE TABLE "product_discounts" (
    "id"         TEXT         NOT NULL,
    "productId"  TEXT         NOT NULL,
    "discountId" TEXT         NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_discounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_discounts_productId_fkey"
        FOREIGN KEY ("productId")  REFERENCES "products"("id")  ON DELETE CASCADE,
    CONSTRAINT "product_discounts_discountId_fkey"
        FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "product_discounts_productId_discountId_key"
    ON "product_discounts"("productId", "discountId");
CREATE INDEX "product_discounts_productId_idx"  ON "product_discounts"("productId");
CREATE INDEX "product_discounts_discountId_idx" ON "product_discounts"("discountId");

-- ── orders ────────────────────────────────────────────────────────────────────

CREATE TABLE "orders" (
    "id"              TEXT             NOT NULL,
    "userId"          TEXT             NOT NULL,
    "status"          "OrderStatus"    NOT NULL DEFAULT 'PENDING',
    "paymentStatus"   "PaymentStatus"  NOT NULL DEFAULT 'PENDING',
    "paymentMethod"   TEXT,
    "paymentRef"      TEXT,
    "total"           DOUBLE PRECISION NOT NULL,
    "subtotal"        DOUBLE PRECISION NOT NULL,
    "discountAmount"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountId"      TEXT,
    "shippingMethod"  TEXT,
    "trackingNumber"  TEXT,
    "shippingName"    TEXT             NOT NULL,
    "shippingEmail"   TEXT             NOT NULL,
    "shippingPhone"   TEXT,
    "shippingAddress" TEXT             NOT NULL,
    "shippingCity"    TEXT             NOT NULL,
    "shippingZip"     TEXT,
    "shippingCountry" TEXT             NOT NULL,
    "notes"           TEXT,
    "createdAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_userId_fkey"
        FOREIGN KEY ("userId")     REFERENCES "users"("id"),
    CONSTRAINT "orders_discountId_fkey"
        FOREIGN KEY ("discountId") REFERENCES "discounts"("id"),
    CONSTRAINT "orders_total_check"          CHECK ("total"          >= 0),
    CONSTRAINT "orders_subtotal_check"       CHECK ("subtotal"       >= 0),
    CONSTRAINT "orders_discountAmount_check" CHECK ("discountAmount" >= 0)
);

CREATE INDEX "orders_userId_idx"        ON "orders"("userId");
CREATE INDEX "orders_status_idx"        ON "orders"("status");
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");
CREATE INDEX "orders_createdAt_idx"     ON "orders"("createdAt" DESC);

-- ── order_items ───────────────────────────────────────────────────────────────

CREATE TABLE "order_items" (
    "id"        TEXT             NOT NULL,
    "orderId"   TEXT             NOT NULL,
    "productId" TEXT             NOT NULL,
    "quantity"  INTEGER          NOT NULL,
    "price"     DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_items_orderId_fkey"
        FOREIGN KEY ("orderId")   REFERENCES "orders"("id")   ON DELETE CASCADE,
    CONSTRAINT "order_items_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id"),
    CONSTRAINT "order_items_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "order_items_price_check"    CHECK ("price"    >= 0)
);

CREATE INDEX "order_items_orderId_idx"   ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- ── reviews ───────────────────────────────────────────────────────────────────

CREATE TABLE "reviews" (
    "id"            TEXT             NOT NULL,
    "userId"        TEXT             NOT NULL,
    "productId"     TEXT             NOT NULL,
    "rating"        INTEGER          NOT NULL,
    "title"         TEXT,
    "comment"       TEXT             NOT NULL,
    "status"        "ReviewStatus"   NOT NULL DEFAULT 'PENDING',
    "isVerified"    BOOLEAN          NOT NULL DEFAULT false,
    "helpfulCount"  INTEGER          NOT NULL DEFAULT 0,
    "moderatedAt"   TIMESTAMP(3),
    "moderatedById" TEXT,
    "createdAt"     TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_userId_fkey"
        FOREIGN KEY ("userId")        REFERENCES "users"("id")    ON DELETE CASCADE,
    CONSTRAINT "reviews_productId_fkey"
        FOREIGN KEY ("productId")     REFERENCES "products"("id") ON DELETE CASCADE,
    CONSTRAINT "reviews_moderatedById_fkey"
        FOREIGN KEY ("moderatedById") REFERENCES "users"("id"),
    CONSTRAINT "reviews_rating_check"
        CHECK ("rating" BETWEEN 1 AND 5),
    CONSTRAINT "reviews_helpfulCount_check"
        CHECK ("helpfulCount" >= 0)
);

CREATE UNIQUE INDEX "reviews_userId_productId_key" ON "reviews"("userId", "productId");
CREATE        INDEX "reviews_productId_idx"        ON "reviews"("productId");
CREATE        INDEX "reviews_status_idx"           ON "reviews"("status");
CREATE        INDEX "reviews_rating_idx"           ON "reviews"("rating");
CREATE        INDEX "reviews_createdAt_idx"        ON "reviews"("createdAt" DESC);

-- ── ratings ───────────────────────────────────────────────────────────────────

CREATE TABLE "ratings" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "productId" TEXT         NOT NULL,
    "value"     INTEGER      NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ratings_userId_fkey"
        FOREIGN KEY ("userId")    REFERENCES "users"("id")    ON DELETE CASCADE,
    CONSTRAINT "ratings_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    CONSTRAINT "ratings_value_check" CHECK ("value" BETWEEN 1 AND 5)
);

CREATE UNIQUE INDEX "ratings_userId_productId_key" ON "ratings"("userId", "productId");
CREATE        INDEX "ratings_productId_idx"        ON "ratings"("productId");
CREATE        INDEX "ratings_value_idx"            ON "ratings"("value");

-- ── wishlist ──────────────────────────────────────────────────────────────────

CREATE TABLE "wishlist" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "productId" TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "wishlist_userId_fkey"
        FOREIGN KEY ("userId")    REFERENCES "users"("id")    ON DELETE CASCADE,
    CONSTRAINT "wishlist_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "wishlist_userId_productId_key" ON "wishlist"("userId", "productId");
CREATE        INDEX "wishlist_userId_idx"            ON "wishlist"("userId");
CREATE        INDEX "wishlist_productId_idx"         ON "wishlist"("productId");

-- ── comparison ────────────────────────────────────────────────────────────────

CREATE TABLE "comparison" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "productId" TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparison_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comparison_userId_fkey"
        FOREIGN KEY ("userId")    REFERENCES "users"("id")    ON DELETE CASCADE,
    CONSTRAINT "comparison_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "comparison_userId_productId_key" ON "comparison"("userId", "productId");
CREATE        INDEX "comparison_userId_idx"            ON "comparison"("userId");
CREATE        INDEX "comparison_productId_idx"         ON "comparison"("productId");

-- ── cart_items ────────────────────────────────────────────────────────────────

CREATE TABLE "cart_items" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "productId" TEXT         NOT NULL,
    "quantity"  INTEGER      NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cart_items_userId_fkey"
        FOREIGN KEY ("userId")    REFERENCES "users"("id")    ON DELETE CASCADE,
    CONSTRAINT "cart_items_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
    CONSTRAINT "cart_items_quantity_check" CHECK ("quantity" > 0)
);

CREATE UNIQUE INDEX "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");
CREATE        INDEX "cart_items_userId_idx"            ON "cart_items"("userId");
CREATE        INDEX "cart_items_productId_idx"         ON "cart_items"("productId");

-- ── user_activity ─────────────────────────────────────────────────────────────

CREATE TABLE "user_activity" (
    "id"        TEXT           NOT NULL,
    "userId"    TEXT           NOT NULL,
    "type"      "ActivityType" NOT NULL,
    "productId" TEXT,
    "orderId"   TEXT,
    "data"      JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_activity_userId_fkey"
        FOREIGN KEY ("userId")    REFERENCES "users"("id")    ON DELETE CASCADE,
    CONSTRAINT "user_activity_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL
);

CREATE INDEX "user_activity_userId_idx"    ON "user_activity"("userId");
CREATE INDEX "user_activity_type_idx"      ON "user_activity"("type");
CREATE INDEX "user_activity_productId_idx" ON "user_activity"("productId");
CREATE INDEX "user_activity_createdAt_idx" ON "user_activity"("createdAt" DESC);

-- ── admin_logs ────────────────────────────────────────────────────────────────

CREATE TABLE "admin_logs" (
    "id"         TEXT              NOT NULL,
    "adminId"    TEXT              NOT NULL,
    "action"     "AdminActionType" NOT NULL,
    "entityType" TEXT,
    "entityId"   TEXT,
    "before"     JSONB,
    "after"      JSONB,
    "ipAddress"  TEXT,
    "createdAt"  TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "admin_logs_adminId_fkey"
        FOREIGN KEY ("adminId") REFERENCES "users"("id")
);

CREATE INDEX "admin_logs_adminId_idx"            ON "admin_logs"("adminId");
CREATE INDEX "admin_logs_action_idx"             ON "admin_logs"("action");
CREATE INDEX "admin_logs_entityType_entityId_idx" ON "admin_logs"("entityType", "entityId");
CREATE INDEX "admin_logs_createdAt_idx"           ON "admin_logs"("createdAt" DESC);
