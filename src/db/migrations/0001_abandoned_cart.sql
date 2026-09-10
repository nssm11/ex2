-- 0001 — Miroir serveur du panier (relance de panier abandonné)
--
-- Le panier vit côté navigateur (localStorage). Cette table est le minimum
-- nécessaire pour que le serveur connaissse son contenu et puisse envoyer une
-- relance après un délai d'inactivité, sans jamais faire confiance au client :
-- seuls `product_id` et `quantity` sont stockés, tout le reste (libellé,
-- image, prix) est relu depuis `products` au moment de l'envoi.
--
-- Appliquer avec « npm run db:push » (drizzle-kit) ou directement :
--   psql "$DATABASE_URL" -f src/db/migrations/0001_abandoned_cart.sql

CREATE TABLE IF NOT EXISTS "carts" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "lines" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "reminded_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "carts_user_idx" ON "carts" ("user_id");
CREATE INDEX IF NOT EXISTS "carts_updated_idx" ON "carts" ("updated_at");
