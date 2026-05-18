"use client";

import type { Document } from "./schema";

export type ShareCreateResponse = {
	slug: string;
	url: string;
	expiresAt: string;
};

export async function createShareLink(
	doc: Document,
): Promise<ShareCreateResponse> {
	const res = await fetch("/api/documents/share", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ doc }),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body?.error ?? `Share failed (${res.status})`);
	}
	return res.json();
}
