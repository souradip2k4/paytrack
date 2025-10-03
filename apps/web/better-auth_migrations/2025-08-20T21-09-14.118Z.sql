create table "users" (
	"id" text not null primary key,
	"name" text not null,
	"email" text not null unique,
	"email_verified" boolean not null,
	"image" text,
	"created_at" timestamp default CURRENT_TIMESTAMP not null,
	"updated_at" timestamp default CURRENT_TIMESTAMP not null
);

create table "sessions" (
	"id" text not null primary key,
	"expires_at" timestamp not null,
	"token" text not null unique,
	"created_at" timestamp not null,
	"updated_at" timestamp not null,
	"ip_address" text,
	"user_agent" text,
	"user_id" text not null references "users" ("id") on delete cascade,
	"active_organization_id" text
);

create table "accounts" (
	"id" text not null primary key,
	"account_id" text not null,
	"provider_id" text not null,
	"user_id" text not null references "users" ("id") on delete cascade,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp not null,
	"updated_at" timestamp not null
);

create table "verifications" (
	"id" text not null primary key,
	"identifier" text not null,
	"value" text not null,
	"expires_at" timestamp not null,
	"created_at" timestamp default CURRENT_TIMESTAMP,
	"updated_at" timestamp default CURRENT_TIMESTAMP
);

create table "organizations" (
	"id" text not null primary key,
	"name" text not null,
	"slug" text not null unique,
	"logo" text,
	"created_at" timestamp not null,
	"metadata" text
);

create table "members" (
	"id" text not null primary key,
	"organization_id" text not null references "organizations" ("id") on delete cascade,
	"user_id" text not null references "users" ("id") on delete cascade,
	"role" text not null,
	"created_at" timestamp not null
);

create table "invitations" (
	"id" text not null primary key,
	"organization_id" text not null references "organizations" ("id") on delete cascade,
	"email" text not null,
	"role" text,
	"status" text not null,
	"expires_at" timestamp not null,
	"inviter_id" text not null references "users" ("id") on delete cascade
);

create table "jwks" (
	"id" text not null primary key,
	"public_key" text not null,
	"private_key" text not null,
	"created_at" timestamp not null
);
