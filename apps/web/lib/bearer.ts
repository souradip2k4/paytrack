import { authClient } from "./auth-client";

export const bearerHeader = async () => {
	let token = "";
	const res = await authClient.token();
	if (res.data) {
		token = res.data.token;
	}
	return {
		Authorization: `Bearer ${token}`,
	};
};
