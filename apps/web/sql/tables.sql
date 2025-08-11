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
	amount integer not null,
	currency varchar(3) default 'usd',
	user_id text references users (id),
	organization_id text references organizations (id),
	external_id varchar(255),
	category_id uuid references categories (id),
	reference_no varchar(255),
	name varchar(50),
	description varchar(1000),
	status varchar(8) default 'paid',
	metadata jsonb,
	transaction_date timestamp default current_timestamp,
	created_at timestamp default current_timestamp,
	updated_at timestamp default current_timestamp
);

create table line_item (
	id uuid primary key default gen_random_uuid(),
	transaction_id uuid references transactions (id) not null,
	amount integer not null,
	name varchar(255),
	description varchar(1000),
	unit_count integer default 1,
	unit_price integer default 0
);
