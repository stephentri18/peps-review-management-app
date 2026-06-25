-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- STORES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  api_key     TEXT UNIQUE NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free'
                CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- WIDGET SETTINGS (auto-created per store)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS widget_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id             UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  theme_color          TEXT NOT NULL DEFAULT '#000000',
  auto_approve         BOOLEAN NOT NULL DEFAULT FALSE,
  require_email        BOOLEAN NOT NULL DEFAULT TRUE,
  show_verified_badge  BOOLEAN NOT NULL DEFAULT TRUE,
  max_media_per_review SMALLINT NOT NULL DEFAULT 3,
  reviews_per_page     SMALLINT NOT NULL DEFAULT 5,
  allow_video          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id          UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,
  product_handle    TEXT,
  product_title     TEXT,
  reviewer_name     TEXT NOT NULL,
  reviewer_email    TEXT NOT NULL,
  rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             TEXT,
  body              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'published', 'rejected')),
  verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  helpful_count     INTEGER NOT NULL DEFAULT 0,
  source            TEXT NOT NULL DEFAULT 'widget'
                      CHECK (source IN ('widget', 'import', 'manual')),
  ip_address        INET,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_store_status
  ON reviews(store_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_product
  ON reviews(store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created
  ON reviews(created_at DESC);

-- ─────────────────────────────────────────
-- REVIEW MEDIA
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_media (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id            UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  url                  TEXT NOT NULL,
  thumbnail_url        TEXT,
  type                 TEXT NOT NULL CHECK (type IN ('image', 'video')),
  width                INTEGER,
  height               INTEGER,
  bytes                INTEGER,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_media_review
  ON review_media(review_id);

-- ─────────────────────────────────────────
-- REVIEW REPLIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID UNIQUE NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- REVIEW VOTES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  vote       TEXT NOT NULL CHECK (vote IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (review_id, ip_address)
);

-- ─────────────────────────────────────────
-- ADMIN USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'admin'
                  CHECK (role IN ('superadmin', 'admin', 'viewer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);