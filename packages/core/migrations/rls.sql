/* This file contains RLS policies and role permissions */
/* It is meant to be run multiple times to update policies */
/* ========================================================================== */
/* ROLE PERMISSIONS */
/* ========================================================================== */
GRANT USAGE ON SCHEMA public TO anon,
authenticated,
auth_admin,
subscription_admin;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
FROM
	anon;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
FROM
	auth_admin;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
FROM
	subscription_admin;

REVOKE TRIGGER,
TRUNCATE ON ALL TABLES IN SCHEMA public
FROM
	authenticated;

/* Auth admin role is used by better auth for special user management */
/* TODO: Make permissions more granular */
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_admin;

REVOKE TRIGGER,
TRUNCATE ON ALL TABLES IN SCHEMA public
FROM
	auth_admin;

/* Subscription admin role is already created via create_subscription_admin_role.sh */
GRANT
SELECT
	ON users TO subscription_admin;

GRANT ALL PRIVILEGES ON app_subscriptions TO subscription_admin;

/* Allow authenticated users to read subscriptions */
REVOKE ALL PRIVILEGES ON app_subscriptions
FROM
	authenticated;

GRANT
SELECT
	ON app_subscriptions TO authenticated;

/* ========================================================================== */
/* RLS POLICIES */
/* ========================================================================== */
/* ========================================================================== */
/* RLS POLICIES FOR CATEGORIES */
/* ========================================================================== */
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS limit_categories ON categories;

CREATE POLICY limit_categories ON categories FOR ALL TO authenticated USING (
	organization_id = org_id ()
	OR (
		organization_id IS NULL
		AND user_id = uid ()
	)
)
WITH
	CHECK (
		organization_id = org_id ()
		OR (
			organization_id IS NULL
			AND user_id = uid ()
		)
	);

/* ========================================================================== */
/* RLS POLICIES FOR TAGS */
/* ========================================================================== */
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS limit_tags ON tags;

CREATE POLICY limit_tags ON tags FOR ALL TO authenticated USING (
	organization_id = org_id ()
	OR (
		organization_id IS NULL
		AND user_id = uid ()
	)
)
WITH
	CHECK (
		organization_id = org_id ()
		OR (
			organization_id IS NULL
			AND user_id = uid ()
		)
	);

/* ========================================================================== */
/* RLS POLICIES FOR TRANSACTIONS */
/* ========================================================================== */
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS limit_transactions ON transactions;

DROP POLICY IF EXISTS limit_transactions_select ON transactions;

DROP POLICY IF EXISTS limit_transactions_insert ON transactions;

DROP POLICY IF EXISTS limit_transactions_update ON transactions;

DROP POLICY IF EXISTS limit_transactions_delete ON transactions;

/* SELECT policy - requires 'list' or 'get' permission */
CREATE POLICY limit_transactions_select ON transactions FOR
SELECT
	TO authenticated USING (
		(
			organization_id IS NULL
			AND user_id = uid ()
		)
		OR (
			organization_id = org_id ()
			AND (
				check_ac_current ('transaction', 'list')
				OR check_ac_current ('transaction', 'get')
			)
		)
	);

/* INSERT policy - requires 'create' permission */
CREATE POLICY limit_transactions_insert ON transactions FOR INSERT TO authenticated
WITH
	CHECK (
		(
			organization_id IS NULL
			AND user_id = uid ()
		)
		OR (
			organization_id = org_id ()
			AND check_ac_current ('transaction', 'create')
		)
	);

/* UPDATE policy - requires 'update' permission */
CREATE POLICY limit_transactions_update ON transactions
FOR UPDATE
	TO authenticated USING (
		(
			organization_id IS NULL
			AND user_id = uid ()
		)
		OR (
			organization_id = org_id ()
			AND check_ac_current ('transaction', 'update')
		)
	)
WITH
	CHECK (
		(
			organization_id IS NULL
			AND user_id = uid ()
		)
		OR (
			organization_id = org_id ()
			AND check_ac_current ('transaction', 'update')
		)
	);

/* DELETE policy - requires 'delete' permission */
CREATE POLICY limit_transactions_delete ON transactions FOR DELETE TO authenticated USING (
	(
		organization_id IS NULL
		AND user_id = uid ()
	)
	OR (
		organization_id = org_id ()
		AND check_ac_current ('transaction', 'delete')
	)
);

/* ========================================================================== */
/* RLS POLICIES FOR DASHBOARD VIEWS */
/* ========================================================================== */
ALTER TABLE dashboard_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS limit_dashboard_views ON dashboard_views;

CREATE POLICY limit_dashboard_views ON dashboard_views FOR ALL TO authenticated USING (
	organization_id = org_id ()
	OR (
		organization_id IS NULL
		AND user_id = uid ()
	)
)
WITH
	CHECK (
		organization_id = org_id ()
		OR (
			organization_id IS NULL
			AND user_id = uid ()
		)
	);
