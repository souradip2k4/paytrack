/* ========================================================================== */
/* SYNC SUPPORT MIGRATION                                                     */
/* Adds soft-delete and sync timestamps to all syncable tables                */
/* Setup up indexes for cursor-based pull queries                             */
/* ========================================================================== */
-- transactions: add deleted_at only (already has updated_at)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- categories: add created_at, updated_at, deleted_at
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT current_timestamp,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT current_timestamp,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

DROP TRIGGER IF EXISTS set_categories_updated_at ON categories;

CREATE TRIGGER set_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp ();

-- subscriptions: add created_at, updated_at, deleted_at
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT current_timestamp,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT current_timestamp,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;

CREATE TRIGGER set_subscriptions_updated_at BEFORE
UPDATE ON subscriptions FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp ();

-- dashboard_views: add deleted_at only (already has created_at and updated_at)
ALTER TABLE dashboard_views
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- indexes for cursor-based pull queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_sync ON transactions (updated_at)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_sync ON categories (updated_at)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_sync ON subscriptions (updated_at)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dashboard_views_sync ON dashboard_views (updated_at)
