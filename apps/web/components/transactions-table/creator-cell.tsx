"use client";

import { useCategories } from "@/lib/query";
import { Row } from "@tanstack/react-table";
import React from "react";
import { CategoryBadge } from "../category-badge";
import { Skeleton } from "../ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { Badge } from "../ui/badge";
import { avatarUrl } from "@/lib/utils";

export const CreatorCell = () => {
    const { data, isPending } = authClient.useSession()
    return (
        <React.Fragment>
            {isPending ? <Skeleton className="h-4 w-16" /> :
                <Badge variant="secondary" className="rounded-full">
                    <img className="h-4 w-4 rounded-full" src={avatarUrl(data?.user.image)} /> {data?.user.name} (you)
                </Badge>
            }
        </React.Fragment>
    );
};
