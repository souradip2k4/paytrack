export const bearerHeader = () => {
	return {
		Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
	};
};
