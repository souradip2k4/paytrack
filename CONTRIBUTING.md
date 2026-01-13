# Contributing

This guide will help you setup `budgetbee` locally.

If you are stuck somewhere, feel free to [email](mailto:hello@sammaji.com) me or reach out to me on [X](https://x.com/sammaji15), happy to help.

There are scripts that can help you set up all this. But scripts are flaky. I'm working on this actively 🙇‍♂️. If it works for you go ahead. Otherwise follow the guide below 👇

## Prerequisites

You must have node, pnpm, docker, etc. installed.

Then, you can clone the repository and install the dependencies:

```bash
git clone https://github.com/sammaji/budgetbee
cd budgetbee
pnpm install
```

## Envs

First, run this command to create a `.env` at the root and symlink it to all the packages and apps that require environment variables.

```bash
chmod +x scripts/*
./scripts/post_install.sh
```

We define all our environment variables here. Add those that are missing.

- Ignore `PGRST_JWT_SECRET` for now, you'll get it later on.
- Set `DEV_ONLY_TEST_USER_ID` to your user id (once created), if you are using scripts to push dummy data.
- `POSTGRESQL_USER`, `POSTGRES_AUTH_ADMIN_USER`, `POSTGRES_SUBSCRIPTION_ADMIN_USER` are user names for postgresql users which different permissions.
- `NEXT_PUBLIC_SITE_URL` is the landing page.
- `NEXT_PUBLIC_APP_URL` is the main application.

## Postgresql + PostgREST

To start postgresql, go to `infra` and run the following command:

```bash
docker compose up
```

This will start postgresql and postgrest container. Make sure all envs related to postgres (those that start with `POSTGRES_`) are set.

### Migrations

There are scripts to automate this, but they are flaky. With your postgres container active, try running these scripts.

```bash
chmod +x scripts/*
./scripts/create_roles.sh
```

If the scripts fail, you need to run the migrations manually.

First, create three users in postgresql with the following permissions:

```sql
CREATE USER postgresql_user WITH PASSWORD 'password';
CREATE USER postgres_auth_admin_user WITH PASSWORD 'password';
CREATE USER postgres_subscription_admin_user WITH PASSWORD 'password';
```

Add the names of these users to your `.env` file.

Once done, run each migration file in `packages/core/migrations` in order.

- First, `better-auth-migrations.sql`
- Then, `init.sql`
- Then, all the other migration files by date.

## apps

Next, go to the root of your project and start your app with this command.

```bash
pnpm turbo dev
```

This will start the following apps:

`docs` - public docs (localhost:3002)
`site` - landing page (localhost:3000)
`web` - main application (localhost:3001)

Now, you can go to `http://localhost:3000/api/auth/jwks` and get the jwks secret. Set the `PGRST_JWT_SECRET` to this jwks secret. (You will have to do this only once)

That should be it. You are good to go.

## Pushing some dummy data

If you want to push some dummy data, we have a script to do so.

```bash
source .env
cd packages/core
pnpm tsx initdb.ts
```

## Folders

`apps/` contain all the web apps
`packages/` contain shared packages
`packages/core` contains auth and db related utilities
`packages/ui` contains shared ui. If you're installing shadcn components, this is the place.
