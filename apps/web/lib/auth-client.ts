import { organizationClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.APP_URL,
	fetchOptions: {
		credentials: "include",
	},
	plugins: [organizationClient(), nextCookies()],
});
