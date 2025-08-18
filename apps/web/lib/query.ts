import { QueryKey, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { authClient } from "./auth-client";
import { db } from "./db";

export const entriesQueryFn = async ({ queryKey }: { queryKey: QueryKey }) => {
	if (
		(queryKey.length < 2 && queryKey[1] === undefined) ||
		queryKey[1] === null
	) {
		return [];
	}
	const res = await axios.get(`/api/users/${queryKey[1]}/entries`);
	const data = JSON.parse(res.data);
	return {
		...data,
		date: new Date(data.date),
	};
};

export const deleteEntryMutationFn = (data?: string) => {
	return axios.delete(`/api/entries/${data}`);
};

export const deleteEntriesMutationFn = (data?: any[]) => {
	const ids = data?.map(value => value.id);
	return axios.delete("/api/entries", {
		data: {
			ids,
		},
	});
};

export const useCategories = () => {
	const { data } = authClient.useSession();
	const query = useQuery({
		queryKey: ["cat", "get", data?.user?.id],
		queryFn: async () => {
			if (!data || !data.user.id) return [];
			const res = await db
				.from("categories")
				.select("*")
				.eq("user_id", data.user.id)
				.order("name");
			if (res.error) return [];
			return res.data;
		},
	});
	return query;
};
