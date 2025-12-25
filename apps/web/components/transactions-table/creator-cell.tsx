"use client";

import { avatarUrl } from "@/lib/utils";
import { authClient } from "@budgetbee/core/auth-client";
import React from "react";
import { Badge } from "@budgetbee/ui/core/badge";
import { Skeleton } from "@budgetbee/ui/core/skeleton";

export const CreatorCell = () => {
	const { data, isPending } = authClient.useSession();

	if (isPending) return <Skeleton className="h-4 w-16" />;

	return (
		<React.Fragment>
			<Badge
				data-editor="disabled"
				variant="secondary"
				className="rounded-full">
				<img
					className="h-4 w-4 rounded-full"
					src={avatarUrl(data?.user.image)}
				/>{" "}
				{data?.user.name} (you)
			</Badge>
		</React.Fragment>
	);
};
