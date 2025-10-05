/* NOTE: Run the better auth migrations first */
/* ========================================================================== */
/* AUTH FUNCTIONS */
/* ========================================================================== */
CREATE OR REPLACE FUNCTION jwt () RETURNS jsonb SECURITY DEFINER AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::jsonb;
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION uid () RETURNS text SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    current_setting('request.jwt.claims', true)::jsonb ->> 'user_id'
  );
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION uid () RETURNS text SECURITY DEFINER AS $$
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

CREATE OR REPLACE FUNCTION org_id () RETURNS text SECURITY DEFINER AS $$
BEGIN
    RETURN COALESCE(
      current_setting('request.jwt.claims', true)::jsonb ->> 'claims' ->> 'organization_id'
    );
END
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION org_role () RETURNS text SECURITY DEFINER AS $$
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
    color varchar(6),
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
	user_id text references users (id) on delete cascade,
	organization_id text references organizations (id) on delete cascade,
	external_id varchar(255),
	category_id uuid references categories (id) on delete set null,
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
	transaction_id uuid references transactions (id) on delete cascade,
	tag_id uuid references tags (id) on delete cascade
);

create table line_items (
	id uuid primary key default gen_random_uuid(),
	transaction_id uuid references transactions (id) on delete cascade,
	name varchar(255),
	description varchar(1000),
	unit_count integer default 1,
	unit_price numeric(10, 2) default 0
);

create table transaction_line_items (
	id uuid primary key default gen_random_uuid(),
	transaction_id uuid references transactions (id) on delete cascade,
	line_item_id uuid references line_items (id) on delete set null
);

create type subscription_status as enum('active', 'paused', 'canceled');

create type subscription_period as enum(
	'monthly',
	'yearly',
	'quarterly',
	'semi-annually',
	'weekly',
	'daily'
);

create table subscriptions (
	id uuid primary key default gen_random_uuid(),
	amount numeric(10, 2),
	title varchar(255) not null,
	description varchar(1000),
	logo_url varchar(255),
	period subscription_period,
	interval_in_days integer,
	category_id uuid references categories (id) on delete set null,
	user_id text references users (id) on delete cascade,
	organization_id text references organizations (id) on delete cascade
);

create type app_subscriptions_status as enum('sub_active', 'sub_inactive');

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

GRANT USAGE ON SCHEMA public TO anon,
authenticated,
auth_admin,
subscription_admin;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
FROM anon;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
FROM auth_admin;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
FROM subscription_admin;

REVOKE TRIGGER,
TRUNCATE ON ALL TABLES IN SCHEMA public
FROM authenticated;

/* Auth admin role is used by better auth for special user management */
/* TODO: Make permissions more granular */
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_admin;

REVOKE TRIGGER,
TRUNCATE ON ALL TABLES IN SCHEMA public
FROM auth_admin;

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
alter table categories enable row level security;

alter table tags enable row level security;

alter table transactions enable row level security;

CREATE POLICY limit_categories ON categories FOR ALL TO authenticated USING (user_id = uid ())
WITH
	CHECK (user_id = uid ());

CREATE POLICY limit_tags ON tags FOR ALL TO authenticated USING (user_id = uid ())
WITH
	CHECK (user_id = uid ());

CREATE POLICY limit_transactions ON transactions FOR ALL TO authenticated USING (user_id = uid ())
WITH
	CHECK (user_id = uid ());

/* ========================================================================== */
/* FUNCTIONS */
/* ========================================================================== */

/* ========================================================================== */
/* Returns the total amount for each category */
DROP FUNCTION IF EXISTS get_transaction_by_category;

CREATE OR REPLACE FUNCTION get_transaction_by_category (params JSONB)
RETURNS TABLE (
	amount NUMERIC(10, 2),
	name VARCHAR(255),
	category_id UUID
) SECURITY INVOKER AS $$
DECLARE
    v_user_id TEXT;
    v_organization_id TEXT;
    v_filters JSONB;
BEGIN
    v_user_id := params->>'user_id';
    v_organization_id := params->>'organization_id';
    v_filters := params->'filters';

    RETURN QUERY
    SELECT SUM(tr.amount), ca.name, ca.id as category_id
    FROM get_filtered_transactions (v_filters) tr
    LEFT JOIN categories ca ON tr.category_id=ca.id
    WHERE tr.user_id = v_user_id
    AND (tr.organization_id = v_organization_id OR tr.organization_id IS NULL)
    GROUP BY ca.id;
END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_by_category (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_by_category (JSONB) TO authenticated;

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_distribution_by_category;

CREATE OR REPLACE FUNCTION get_transaction_distribution_by_category (params JSONB) RETURNS TABLE (
	category_id UUID,
	day DATE,
	credit NUMERIC(10, 2),
	debit NUMERIC(10, 2),
	balance NUMERIC(10, 2),
	name VARCHAR(255)
) SECURITY INVOKER AS $$
DECLARE
    v_user_id TEXT;
    v_organization_id TEXT;
    v_filters JSONB;
BEGIN
    v_user_id := params->>'user_id';
    v_organization_id := params->>'organization_id';
    v_filters := params->'filters';
RETURN QUERY 
WITH daily_transactions AS (
    SELECT
        tr.category_id,
        DATE (tr.transaction_date) AS day,
        COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount < 0), 0) * -1 AS credit,
        COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount > 0), 0) AS debit,
        COALESCE(SUM(tr.amount), 0) AS balance
    FROM get_filtered_transactions (v_filters) tr
    WHERE tr.user_id = v_user_id
    AND (tr.organization_id = v_organization_id OR tr.organization_id IS NULL)
    GROUP BY DATE (tr.transaction_date), tr.category_id
)
SELECT t.category_id, t.day, t.credit, t.debit, t.balance, c.name
FROM daily_transactions t
LEFT JOIN categories c ON c.id = t.category_id
ORDER BY t.day;

END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_distribution_by_category (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_distribution_by_category (JSONB) TO authenticated;

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_transaction_distribution_by_status;

CREATE TYPE transaction_distribution_by_status AS (
    status VARCHAR(8),
    day DATE,
    credit NUMERIC(10, 2),
    debit NUMERIC(10, 2),
    balance NUMERIC(10, 2)
);

CREATE OR REPLACE FUNCTION get_transaction_distribution_by_status (params JSONB)
RETURNS SETOF transaction_distribution_by_status
SECURITY INVOKER AS $$
DECLARE
    v_user_id TEXT;
    v_organization_id TEXT;
    v_filters JSONB;
BEGIN
    v_user_id := params->>'user_id';
    v_organization_id := params->>'organization_id';
    v_filters := params->'filters';
RETURN QUERY 
SELECT
    tr.status,
    DATE (tr.transaction_date) AS day,
    (COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount < 0), 0) * -1)::NUMERIC(10, 2) AS credit,
    (COALESCE(SUM(tr.amount) FILTER (WHERE tr.amount > 0), 0))::NUMERIC(10, 2) AS debit,
    (COALESCE(SUM(tr.amount), 0))::NUMERIC(10, 2) AS balance
FROM get_filtered_transactions (v_filters) tr
WHERE tr.user_id = v_user_id
AND (tr.organization_id = v_organization_id OR tr.organization_id IS NULL)
GROUP BY DATE (tr.transaction_date), tr.status;

END
$$ LANGUAGE plpgsql STABLE;

REVOKE ALL ON FUNCTION get_transaction_distribution_by_status (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_transaction_distribution_by_status (JSONB) TO authenticated;

/* ========================================================================== */
DROP FUNCTION IF EXISTS get_filtered_transactions;

CREATE OR REPLACE FUNCTION get_filtered_transactions (filters jsonb) RETURNS SETOF transactions AS $$
DECLARE
    query_sql text;
    where_clauses text[] := '{}';
    filter_item jsonb;
    field text;
    operation text;
    value jsonb;
    column_name text;
    value_array text[];
BEGIN
    query_sql := 'SELECT id, amount, currency, user_id, organization_id, external_id, category_id, reference_no, name, description, status, source, metadata, transaction_date, created_at, updated_at FROM transactions';

    IF filters IS NULL OR jsonb_typeof(filters) != 'array' OR jsonb_array_length(filters) = 0 THEN
        RETURN QUERY EXECUTE query_sql;
        RETURN;
    END IF;

    -- Loop through each filter object in the jsonb array
    FOR filter_item IN SELECT * FROM jsonb_array_elements(filters)
    LOOP
        -- Extract field, operation, and value from the filter object
        field       := filter_item->>'field';
        operation   := filter_item->>'operation';
        value       := filter_item->'value';

        -- Map the user-friendly field name to the actual column name for security.
        -- This acts as a whitelist to prevent arbitrary column filtering.
        SELECT
            CASE field
                WHEN 'amount'           THEN 'amount'
                WHEN 'category'       THEN 'category_id'
                WHEN 'status'           THEN 'status'
                WHEN 'created_at'       THEN 'created_at'
                WHEN 'updated_at'       THEN 'updated_at'
                WHEN 'transaction_date' THEN 'transaction_date'
                ELSE NULL -- Ignore any fields not in this list
            END
        INTO column_name;

        -- If the field is not in our whitelist, skip to the next filter
        IF column_name IS NULL THEN
            CONTINUE;
        END IF;

        -- === Amount Filtering (numeric) ===
        IF field = 'amount' THEN
            IF operation IN ('eq', 'gt', 'gte', 'lt', 'lte') AND jsonb_typeof(value) = 'number' THEN
                where_clauses := where_clauses || format('%I %s %L', column_name,
                    CASE operation
                        WHEN 'eq'  THEN '='
                        WHEN 'gt'  THEN '>'
                        WHEN 'gte' THEN '>='
                        WHEN 'lt'  THEN '<'
                        WHEN 'lte' THEN '<='
                    END,
                    value #>> '{}' -- Extracts the numeric value as text for the literal
                );
            END IF;

        -- === Categories Filtering (uuid[]) ===
        ELSIF field = 'category' THEN
            IF operation = 'is empty' THEN
                where_clauses := where_clauses || format('%I IS NULL', column_name);
            ELSIF operation IN ('is', 'is not') AND jsonb_typeof(value) = 'array' AND jsonb_array_length(value) > 0 THEN
                -- Convert the jsonb array of text into a PostgreSQL text array
                SELECT array_agg(elem) INTO value_array FROM jsonb_array_elements_text(value) AS elem;
                IF operation = 'is' THEN
                    where_clauses := where_clauses || format('%I = ANY(%L::uuid[])', column_name, value_array);
                ELSE -- 'is not'
                    where_clauses := where_clauses || format('NOT (%I = ANY(%L::uuid[]))', column_name, value_array);
                END IF;
            END IF;

        -- === Status Filtering (text[]) ===
        ELSIF field = 'status' THEN
            IF operation = 'is empty' THEN
                where_clauses := where_clauses || format('%I IS NULL', column_name);
            ELSIF operation IN ('is', 'is not') AND jsonb_typeof(value) = 'array' AND jsonb_array_length(value) > 0 THEN
                SELECT array_agg(elem) INTO value_array FROM jsonb_array_elements_text(value) AS elem;
                IF operation = 'is' THEN
                    where_clauses := where_clauses || format('%I = ANY(%L)', column_name, value_array);
                ELSE -- 'is not'
                    where_clauses := where_clauses || format('NOT (%I = ANY(%L))', column_name, value_array);
                END IF;
            END IF;

        -- === Date/Timestamp Filtering ===
        ELSIF field IN ('created_at', 'updated_at', 'transaction_date') THEN
             IF operation = 'from' AND jsonb_typeof(value) = 'string' THEN
                where_clauses := where_clauses || format('%I >= %L::timestamp', column_name, value #>> '{}');
             ELSIF operation = 'to' AND jsonb_typeof(value) = 'string' THEN
                where_clauses := where_clauses || format('%I <= %L::timestamp', column_name, value #>> '{}');
             ELSIF operation = 'between' AND jsonb_typeof(value) = 'array' AND jsonb_array_length(value) = 2 THEN
                where_clauses := where_clauses || format('%I BETWEEN %L::timestamp AND %L::timestamp', column_name, value->>0, value->>1);
             END IF;
        END IF;

    END LOOP;

    -- If any WHERE clauses were generated, append them to the main query
    IF array_length(where_clauses, 1) > 0 THEN
        query_sql := query_sql || ' WHERE ' || array_to_string(where_clauses, ' AND ');
    END IF;

    RETURN QUERY EXECUTE query_sql;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION get_filtered_transactions (JSONB)
FROM
	anon,
	authenticated;

REVOKE ALL ON FUNCTION get_filtered_transactions (JSONB)
FROM
	anon,
	authenticated;

GRANT
EXECUTE ON FUNCTION get_filtered_transactions (JSONB) TO authenticated;

GRANT
EXECUTE ON FUNCTION get_filtered_transactions (JSONB) TO authenticated;

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

CREATE TRIGGER on_user_insert_create_default_categories
AFTER INSERT ON "users" FOR EACH ROW
EXECUTE FUNCTION create_default_categories ();

CREATE OR REPLACE FUNCTION set_updated_at_timestamp () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE
UPDATE ON transactions FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp ();
