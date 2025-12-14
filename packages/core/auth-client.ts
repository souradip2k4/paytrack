import { polarClient } from "@polar-sh/better-auth/client";
import { jwtClient, organizationClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL!,
	fetchOptions: {
		credentials: "include",
		auth: {
			type: "Bearer",
			token: () => {
				try {
					const token = localStorage.getItem("bearer_token") || "";
					return token;
				} catch (e) {
					console.log(
						"Failed to get from localStorage, localStorage does not exists. Make sure you are running this on a browser.",
					);
					return "";
				}
			},
		},
		onSuccess: ctx => {
			const authToken = ctx.response.headers.get("set-auth-token");
			console.log("set-auth-token: ", authToken);
			try {
				if (authToken) localStorage.setItem("bearer_token", authToken);
			} catch (e) {
				console.log(
					"Failed to set to localStorage, localStorage does not exists. Make sure you are running this on a browser.",
				);
			}
		},
	},
	plugins: [organizationClient(), polarClient(), jwtClient(), nextCookies()],
});

export { authClient };
