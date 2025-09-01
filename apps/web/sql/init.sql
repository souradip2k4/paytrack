/* NOTE: Run the better auth migrations first */

/* ========================================================================== */
/* AUTH FUNCTIONS */
/* ========================================================================== */
CREATE OR REPLACE FUNCTION jwt() RETURNS jsonb SECURITY DEFINER AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::jsonb;
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION uid() RETURNS text SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'
  );
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION uid() RETURNS text SECURITY DEFINER AS $$
DECLARE
    user_id text;
BEGIN
  user_id := COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'
  );
  RAISE NOTICE 'user_id: %', user_id;
  RETURN user_id;
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION org_id() RETURNS text SECURITY DEFINER AS $$
BEGIN
    RETURN COALESCE(
      current_setting('request.jwt.claims', true)::jsonb ->> 'claims' ->> 'organization_id'
    );
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION org_role() RETURNS text SECURITY DEFINER AS $$
BEGIN
    RETURN COALESCE(
      current_setting('request.jwt.claims', true)::jsonb ->> 'claims' ->> 'organization_role'
    );
END
$$ LANGUAGE plpgsql STABLE;

/* ========================================================================== */
/* TABLES */
/* ========================================================================== */
create table categories (
	id uuid primary key default gen_random_uuid(),
	name varchar(255) not null,
	description varchar(1000),
	user_id text references users (id),
	organization_id text references organizations (id)
);

create table tags (
	id uuid primary key default gen_random_uuid(),
	name varchar(255) not null,
	description varchar(1000),
	user_id text references users (id),
	organization_id text references organizations (id)
);

create table transactions (
	id uuid primary key default gen_random_uuid(),
	amount numeric(10, 2) not null,
	currency varchar(3) default 'usd',
	user_id text references users (id),
	organization_id text references organizations (id),
	external_id varchar(255),
	category_id uuid references categories (id),
	reference_no varchar(255),
	name varchar(50),
	description varchar(1000),
	status varchar(8) default 'paid',
    source varchar(255) default 'manual',
	metadata jsonb,
	transaction_date timestamp default current_timestamp,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp
);

create table transaction_tags (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid references transactions (id) not null,
    tag_id uuid references tags (id) not null
);

create table line_items (
	id uuid primary key default gen_random_uuid(),
	transaction_id uuid references transactions (id) not null,
	name varchar(255),
	description varchar(1000),
	unit_count integer default 1,
	unit_price numeric(10, 2) default 0
);

create table transaction_line_items (
    id uuid primary key default gen_random_uuid(),
    transaction_id uuid references transactions (id) not null,
    line_item_id uuid references line_items (id) not null
);

create type subscription_status as enum ('active', 'paused', 'canceled');
create type subscription_period as enum ('monthly', 'yearly', 'quarterly', 'semi-annually', 'weekly', 'daily');

create table subscriptions (
    id uuid primary key default gen_random_uuid(),
    amount numeric(10, 2),
    title varchar(255) not null,
    description varchar(1000),
    logo_url varchar(255),
    period subscription_period,
    interval_in_days integer,
    user_id text references users (id),
    organization_id text references organizations (id)
);


create type app_subscriptions_status as enum ('sub_active','sub_inactive');

create table app_subscriptions (
    id text not null primary key,
    status app_subscriptions_status default 'sub_inactive',
    amount_paid numeric(10, 2),
    starts_at date,
    ends_at date,
    period_start date not null,
    period_end date,
    product_id text not null,
    user_id text references users (id),
    organization_id text references organizations (id)
);


/* ========================================================================== */
/* AUTH ROLES */
/* Some of these roles are created in separate scripts */
/* Make sure to run them first */
/* ========================================================================== */
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated, subscription_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM subscription_admin;
REVOKE TRIGGER, TRUNCATE ON ALL TABLES IN SCHEMA public FROM authenticated;

/* Subscription admin role is already created via create_subscription_admin_role.sh */
GRANT SELECT ON users TO subscription_admin;
GRANT ALL PRIVILEGES ON app_subscriptions TO subscription_admin;

/* Allow authenticated users to read subscriptions */
REVOKE ALL PRIVILEGES ON app_subscriptions FROM authenticated;
GRANT SELECT ON app_subscriptions TO authenticated;

/* ========================================================================== */
/* RLS POLICIES */
/* ========================================================================== */
alter table categories enable row level security;
alter table tags enable row level security;
alter table transactions enable row level security;

CREATE POLICY limit_categories ON categories FOR ALL TO authenticated
USING (user_id = uid())
WITH CHECK (user_id = uid());

CREATE POLICY limit_tags ON tags FOR ALL TO authenticated
USING (user_id = uid())
WITH CHECK (user_id = uid());

CREATE POLICY limit_transactions ON transactions FOR ALL TO authenticated
USING (user_id = uid())
WITH CHECK (user_id = uid());

/* ========================================================================== */
/* FUNCTIONS */
/* ========================================================================== */
CREATE TYPE transaction_query_params AS (
    start_date date,
    end_date date,
    user_id text,
    organization_id text
);

/* ========================================================================== */
/* Returns the highest or lowest credit or debit for the user */
DROP FUNCTION IF EXISTS get_tranasction_credit_summary(transaction_query_params, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS get_tranasction_debit_summary(transaction_query_params, BOOLEAN, INTEGER);

CREATE OR REPLACE FUNCTION get_tranasction_credit_summary(
    params transaction_query_params,
    is_asc BOOLEAN,
    count INTEGER
) RETURNS TABLE (
    amount numeric(10, 2),
    day DATE
) SECURITY INVOKER AS $$

BEGIN

IF is_asc THEN
    RETURN QUERY
        SELECT SUM(tr.amount) FILTER (WHERE tr.amount < 0) AS amount, DATE (tr.transaction_date) AS day
        FROM transactions tr
        WHERE tr.transaction_date >= params.start_date AND tr.transaction_date < (params.end_date + INTERVAL '1 day')
        AND tr.user_id = params.user_id
        AND (tr.organization_id = params.organization_id OR tr.organization_id IS NULL)
        GROUP BY DATE (tr.transaction_date)
        ORDER BY amount ASC
        LIMIT count;
ELSE
    RETURN QUERY
        SELECT SUM(tr.amount) FILTER (WHERE tr.amount < 0) AS amount, DATE (tr.transaction_date) AS day
        FROM transactions tr
        WHERE tr.transaction_date >= params.start_date AND tr.transaction_date < (params.end_date + INTERVAL '1 day')
        AND tr.user_id = params.user_id
        AND (tr.organization_id = params.organization_id OR tr.organization_id IS NULL)
        GROUP BY DATE (tr.transaction_date)
        ORDER BY amount DESC
        LIMIT count;
END IF;

END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_tranasction_debit_summary(
    params transaction_query_params,
    is_asc BOOLEAN,
    count INTEGER
) RETURNS TABLE (
    amount numeric(10, 2),
    day DATE
) SECURITY INVOKER AS $$

BEGIN

IF is_asc THEN
    RETURN QUERY
        SELECT SUM(tr.amount) FILTER (WHERE tr.amount > 0) AS amount, DATE (tr.transaction_date) AS day
        FROM transactions tr
        WHERE tr.transaction_date >= params.start_date AND tr.transaction_date < (params.end_date + INTERVAL '1 day')
        AND tr.user_id = params.user_id
        AND (tr.organization_id = params.organization_id OR tr.organization_id IS NULL)
        GROUP BY DATE (tr.transaction_date)
        ORDER BY amount ASC
        LIMIT count;
ELSE
    RETURN QUERY
        SELECT SUM(tr.amount) FILTER (WHERE tr.amount < 0) AS amount, DATE (tr.transaction_date) AS day
        FROM transactions tr
        WHERE tr.transaction_date >= params.start_date AND tr.transaction_date < (params.end_date + INTERVAL '1 day')
        AND tr.user_id = params.user_id
        AND (tr.organization_id = params.organization_id OR tr.organization_id IS NULL)
        GROUP BY DATE (tr.transaction_date)
        ORDER BY amount DESC
        LIMIT count;
END IF;

END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_tranasction_credit_summary (transaction_query_params, BOOLEAN, INTEGER) FROM anon, authenticated;
REVOKE ALL ON FUNCTION get_tranasction_debit_summary (transaction_query_params, BOOLEAN, INTEGER) FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION get_tranasction_credit_summary (transaction_query_params, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tranasction_debit_summary (transaction_query_params, BOOLEAN, INTEGER) TO authenticated;
/* ========================================================================== */

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_by_category (transaction_query_params);
CREATE OR REPLACE FUNCTION get_transaction_by_category (
    params transaction_query_params
) RETURNS TABLE (
	amount numeric(10, 2),
	name varchar(255),
	category_id uuid
) SECURITY INVOKER AS $$
BEGIN
    RETURN QUERY
    SELECT SUM(tr.amount), ca.name, ca.id as category_id
    FROM transactions tr
    LEFT JOIN categories ca ON tr.category_id=ca.id
    WHERE tr.transaction_date >= params.start_date AND tr.transaction_date < (params.end_date + INTERVAL '1 day')
    AND tr.user_id = params.user_id
    AND (tr.organization_id = params.organization_id OR tr.organization_id IS NULL)
    GROUP BY ca.id;
END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_by_category (transaction_query_params)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_by_category (transaction_query_params) TO authenticated;
/* ========================================================================== */


/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_distribution_by_category;
CREATE OR REPLACE FUNCTION get_transaction_distribution_by_category (
    params transaction_query_params
) RETURNS TABLE (
	category_id UUID,
	day DATE,
	credit NUMERIC(10, 2),
	debit NUMERIC(10, 2),
	balance NUMERIC(10, 2),
	name VARCHAR(255)
) SECURITY INVOKER AS $$
BEGIN

RETURN QUERY 
WITH daily_transactions AS (
    SELECT
        tr.category_id,
        DATE (tr.transaction_date) AS day,
        COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount < 0), 0) * -1 AS credit,
        COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount > 0), 0) AS debit,
        COALESCE(SUM(tr.amount), 0) AS balance
    FROM transactions tr
    WHERE tr.transaction_date >= params.start_date AND tr.transaction_date < (params.end_date + INTERVAL '1 day')
    AND tr.user_id = params.user_id
    AND (tr.organization_id = params.organization_id OR tr.organization_id IS NULL)
    GROUP BY DATE (tr.transaction_date), tr.category_id
)
SELECT t.category_id, t.day, t.credit, t.debit, t.balance, c.name
FROM daily_transactions t
LEFT JOIN categories c ON c.id = t.category_id
ORDER BY t.day;

END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_distribution_by_category (transaction_query_params)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_distribution_by_category (transaction_query_params) TO authenticated;
/* ========================================================================== */

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_distribution_by_status (transaction_query_params);
CREATE OR REPLACE FUNCTION get_transaction_distribution_by_status (
    params transaction_query_params
) RETURNS TABLE (
    status VARCHAR(8),
	day DATE,
	credit NUMERIC(10, 2),
	debit NUMERIC(10, 2),
	balance NUMERIC(10, 2)
) SECURITY INVOKER AS $$
BEGIN

RETURN QUERY 
SELECT
    tr.status,
    DATE (tr.transaction_date) AS day,
    COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount < 0), 0) * -1 AS credit,
    COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount > 0), 0) AS debit,
    COALESCE(SUM(tr.amount), 0) AS balance
FROM transactions tr
WHERE tr.transaction_date >= params.start_date AND tr.transaction_date < (params.end_date + INTERVAL '1 day')
AND tr.user_id = params.user_id
AND (tr.organization_id = params.organization_id OR tr.organization_id IS NULL)
GROUP BY DATE (tr.transaction_date), tr.status;

END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_distribution_by_status (transaction_query_params)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_distribution_by_status (transaction_query_params) TO authenticated;
/* ========================================================================== */


/* ========================================================================== */
/* TRIGGERS */
/* ========================================================================== */
CREATE OR REPLACE FUNCTION create_default_categories () RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO categories (name, user_id)
    VALUES ('Food', NEW.id), ('Travel', NEW.id), ('Sales', NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_insert_create_default_categories AFTER INSERT ON "users" FOR EACH ROW
EXECUTE FUNCTION create_default_categories ();

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON transactions FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
