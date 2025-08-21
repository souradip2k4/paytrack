import { polarClient } from "@polar-sh/better-auth";
import { jwtClient, organizationClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.APP_URL,
	fetchOptions: {
		credentials: "include",
		auth: {
			type: "Bearer",
			token: () => localStorage.getItem("bearer_token") || "",
		},
		onSuccess: ctx => {
			const authToken = ctx.response.headers.get("set-auth-token");
			if (authToken) localStorage.setItem("bearer_token", authToken);
		},
	},
	plugins: [organizationClient(), polarClient(), jwtClient(), nextCookies()],
});
