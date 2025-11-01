You are a software engineer working on a SaaS application. You task is to write clean and efficient code.

## Tech stack

- Next.js
- PostgreSQL with PostREST and `@supabase/supabase-js` to query PostgREST api
- TailwindCSS and `@shadcn/ui`
- TypeScript
- Better-auth for authentication
- Resend for email sending

## Files

- `app` - Next.js app directory
- `components` - Contains all the components. If you're asked to create a new component, please create it here
- `compoenents/ui` - Contains core components, such as buttons, inputs. Installed by `@shadcn/ui`. Do not create new components or modify existing ones here.
- `lib` - Contains miscellaneous code
- `lib/query.ts` - Contains some tanstack query code, abstracted as hooks. If the queries grow large, I put it here.
- `lib/store.ts` - Contains the global store. Not all stores are here. All store files end with `store.ts`.
- `lib/chart-store.ts` - Contains the chart store.
- `lib/db.ts` - Contains the db client.
- `lib/auth.ts` - Contains the auth configuration (better-auth).
- `lib/auth-client.ts` - Contains the auth client (better-auth).

## Code rules

### db client

We are using PostGreSQL for backend database. We use PostGREST to expose the database to the frontend. We have a `db()` function that is used to query the PostGREST api.

The `db()` is similar to supabase client. Infact it uses `@supabase/supabase-js` under the hood.

Here's some examples:

```ts
"use client";

import { getDb } from "@budgetbee/core/db";
import { bearerHeaders } from "@/lib/bearer-headers";

// bearerHeaders() returns a headers object with the bearer token, can only be called in client components
// for server components, use await headers() instead (from next/headers)
const { data, error } = await db(await bearerHeaders())
	.from("transactions")
	.select("*")
	.eq("id", id);
```

### auth client

We are using `better-auth` for authentication.

You can use the `authClient` to access sessions, tokens, subscription intents, etc.

```ts
import { authClient } from "@budgetbee/core/auth-client";

const {
	data: { session, user },
	error,
	isPending,
} = authClient.useSession();
```

For server side, you can use `auth` object to access sessions, tokens, subscription intents, etc.

```ts
import { auth } from "@budgetbee/core/auth";
import { headers } from "next/headers";

const { data, error } = await auth.api.session.getSession({
	headers: await headers(),
});
```

Better auth uses plugins.

We are using these plugins:

Organization - `https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/plugins/organization.mdx`
Subscription and payments - `https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/plugins/polar.mdx`
JWT - `https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/plugins/jwt.mdx` (we are using session auth, but jwt is used to authenticate and authorize the PostGREST api)
Bearer - `https://raw.githubusercontent.com/better-auth/better-auth/refs/heads/main/docs/content/docs/plugins/bearer.mdx`

---

If you need more information, you can ask me.
