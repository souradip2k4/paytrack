"use client";

import { Button } from "@budgetbee/ui/core/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createShareLink } from "@/lib/documents/share-client";
import type { Document } from "@/lib/documents/schema";

export function ShareDialog({
	open,
	onOpenChange,
	doc,
}: {
	open: boolean;
	onOpenChange: (next: boolean) => void;
	doc: Document;
}) {
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			setUrl(null);
			setError(null);
			return;
		}
		setLoading(true);
		createShareLink(doc)
			.then(res => {
				setUrl(res.url);
			})
			.catch(err => {
				setError(err instanceof Error ? err.message : "Share failed");
			})
			.finally(() => setLoading(false));
	}, [open, doc]);

	const copy = async () => {
		if (!url) return;
		await navigator.clipboard.writeText(url);
		toast.success("Link copied");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Share link</DialogTitle>
					<DialogDescription>
						Anyone with the link can view and download a PDF of this
						document.
					</DialogDescription>
				</DialogHeader>

				{loading ?
					<div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
						<Loader2 className="size-4 animate-spin" />
						Creating link...
					</div>
				: error ?
					<p className="text-destructive text-sm">{error}</p>
				: url ?
					<div className="flex items-center gap-2">
						<Input readOnly value={url} />
						<Button size="icon" variant="outline" onClick={copy}>
							<Copy className="size-4" />
						</Button>
					</div>
				:	null}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
