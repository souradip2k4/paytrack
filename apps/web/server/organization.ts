"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function getActiveOrganization(userId: string) {
	const { data, error } = await db(await headers())
		.from("members")
		.select("organization_id")
		.eq("user_id", userId)
		.order("createdAt", {
			ascending: true,
		})
		.limit(1)
		.single();
	if (error) {
		console.error(error);
		return null;
	}
	return data.organization_id;
}
