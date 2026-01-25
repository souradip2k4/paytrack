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
	amount numeric(10, 2) default 0,
	currency varchar(3) default 'usd',
	user_id text references users (id) on delete cascade,
	organization_id text references organizations (id) on delete cascade,
	external_id varchar(255),
	category_id uuid references categories (id) on delete set null,
	reference_no varchar(255),
	name varchar(255),
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
