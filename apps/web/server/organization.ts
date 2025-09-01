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
		console.log("ERROR: failed to get active organization:", error);
		return null;
	}
	return data.organization_id;
}

export async function getActiveSubscription(userId: string) {
	const { data, error } = await db(await headers())
		.from("app_subscriptions")
		.select("id")
		.eq("user_id", userId)
		.gte("period_start", new Date().toISOString())
		.lte("period_end", new Date().toISOString())
		.limit(1)
		.single();

	console.log("data: ", data);
	console.log("error: ", error);

	if (error) {
		console.log("ERROR: failed to get active organization:", error);
		return null;
	}
	return data;
}

type UpsertSubscription = {
	email: string;
	amount_paid: number;
	period_start: string;
	period_end: string;
	organization_id?: string;
	subscription_id: string;
	product_id: string;
};

export async function upsertSubscription({
	email,
	amount_paid,
	period_start,
	period_end,
	organization_id,
	subscription_id,
	product_id,
}: UpsertSubscription) {
	const { data: user, error: user_id_error } = await db(await headers())
		.from("users")
		.select("id")
		.eq("email", email)
		.single();

	if (user_id_error) {
		console.log("ERROR: failed to get user_id from email:", user_id_error);
		return null;
	}

	const { id: user_id } = user;
	if (user_id === null || user_id === undefined || user_id === "") {
		console.log("ERROR: user_id is null or undefined");
		return null;
	}

	const { data, error } = await db(await headers())
		.from("app_subscriptions")
		.upsert({
			id: subscription_id,
			amount_paid,
			period_start,
			period_end,
			user_id,
			organization_id,
			product_id,
		})
		.eq("id", subscription_id)
		.eq("user_id", user_id)
		.eq("organization_id", organization_id);
	if (error) {
		console.log("ERROR: failed to upsert subscription:", error);
		return null;
	}
	return data;
}
