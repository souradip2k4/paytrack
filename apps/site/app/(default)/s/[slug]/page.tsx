import { ShareView } from "@/components/documents/share-view";
import { DOC_TYPE_CONFIG } from "@/lib/documents/defaults";
import { documentSchema, type Document } from "@/lib/documents/schema";
import { getMarketingRedis, shareKey } from "@/lib/documents/share-server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const SLUG_PATTERN = /^[A-Za-z0-9_-]{8,16}$/;

async function loadShared(slug: string): Promise<Document | null> {
	if (!SLUG_PATTERN.test(slug)) return null;
	let redis;
	try {
		redis = getMarketingRedis();
	} catch {
		return null;
	}
	const raw = await redis.get(shareKey(slug));
	if (!raw) return null;
	try {
		const wrapper = JSON.parse(raw);
		const parsed = documentSchema.safeParse(wrapper.doc);
		if (!parsed.success) return null;
		return parsed.data;
	} catch {
		return null;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const doc = await loadShared(slug);
	if (!doc) {
		return {
			title: "Shared document not found | Paytrack",
			robots: { index: false, follow: false },
		};
	}
	const cfg = DOC_TYPE_CONFIG[doc.type];
	const number = `${doc.meta.prefix}${doc.meta.serial}`;
	return {
		title: `${cfg.labels.title} ${number} from ${doc.company.name || "Paytrack"} | Paytrack`,
		description: `${cfg.labels.title} ${number}${doc.client.name ? ` for ${doc.client.name}` : ""}.`,
		robots: { index: false, follow: false },
	};
}

export default async function SharedDocumentPage({ params }: Props) {
	const { slug } = await params;
	const doc = await loadShared(slug);
	if (!doc) notFound();

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
			<ShareView doc={doc} />
		</div>
	);
}
