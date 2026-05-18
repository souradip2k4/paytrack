"use client";

import { Button } from "@budgetbee/ui/core/button";
import { Copy, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DOC_TYPE_CONFIG } from "@/lib/documents/defaults";
import type { Document } from "@/lib/documents/schema";
import { DocumentPreview } from "./preview/document-preview";

export function ShareView({ doc }: { doc: Document }) {
	const [downloading, setDownloading] = useState(false);

	const onDownload = async () => {
		setDownloading(true);
		try {
			const { pdf } = await import("@react-pdf/renderer");
			const { DocumentPDF } = await import("./preview/pdf-document");
			const blob = await pdf(<DocumentPDF doc={doc} />).toBlob();
			const url = URL.createObjectURL(blob);
			const a = window.document.createElement("a");
			a.href = url;
			a.download = `${DOC_TYPE_CONFIG[doc.type].labels.title.toLowerCase()}-${doc.meta.prefix}${doc.meta.serial}.pdf`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "PDF generation failed",
			);
		} finally {
			setDownloading(false);
		}
	};

	const onCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success("Link copied");
		} catch {
			toast.error("Copy failed");
		}
	};

	return (
		<div>
			<div className="border-border bg-card mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3">
				<div className="text-muted-foreground text-sm">
					Shared {DOC_TYPE_CONFIG[doc.type].labels.title.toLowerCase()}
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" onClick={onCopyLink}>
						<Copy className="size-4" />
						Copy link
					</Button>
					<Button
						size="sm"
						onClick={onDownload}
						isLoading={downloading}>
						<Download className="size-4" />
						Download PDF
					</Button>
				</div>
			</div>
			<div className="bg-muted/40 border-border rounded-3xl border p-2 sm:p-4">
				<div className="overflow-x-auto">
					<div className="min-w-[640px] sm:min-w-0">
						<DocumentPreview doc={doc} />
					</div>
				</div>
			</div>
		</div>
	);
}
