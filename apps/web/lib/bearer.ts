import { authClient } from "./auth-client";

export const bearerHeader = async () => {
	const res = await authClient.token();
	let token = res.data ? res.data.token : "";
	return { Authorization: `Bearer ${token}` };
};
