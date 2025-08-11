"use server";

import { db } from "@/lib/db";

export async function getActiveOrganization(userId: string) {
	const { data, error } = await db
		.from("members")
		.select("organizationId")
		.eq("user_id", userId)
		.order("createdAt", { ascending: true })
		.limit(1)
		.single();
	if (error) {
		console.error(error);
		return null;
	}
	return data.organizationId;
}
