import { organizationClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: "https://budgetbee.site",
	fetchOptions: {
		credentials: "include",
	},
	plugins: [organizationClient(), nextCookies()],
});
