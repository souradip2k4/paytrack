import { type Entry } from "@/app/api/[[...route]]/server";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import axios from "axios";
import React from "react";

export const CategoryCell = ({ row }: { row: Row<Entry> }) => {
	const category_id = row.original.category_id;
	const { user } = useUser();
	const { data } = useQuery<unknown, unknown, Map<string, string>>({
		queryKey: ["categories", "GET", user?.id, "MAP"],
		queryFn: async () => {
			if (!user) {
				return [];
			}
			const res = await axios.get(`/api/users/${user?.id}/categories`);
			const idToNameMap = new Map<string, string>();
			res.data.forEach((c: any) => {
				idToNameMap.set(c.id, c.name);
			});
			return idToNameMap;
		},
		enabled: !!user && !!user.id,
	});
	return (
		<React.Fragment>
			{category_id && (
				<Badge variant="secondary" key={category_id}>
					{data?.get(category_id)}
				</Badge>
			)}
		</React.Fragment>
	);
};
