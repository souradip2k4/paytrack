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
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	deleteTemplate,
	listTemplates,
	saveTemplate,
	type SavedTemplate,
} from "@/lib/documents/storage";
import type { Document, DocumentType } from "@/lib/documents/schema";

export function TemplatesDialog({
	open,
	onOpenChange,
	doc,
	onLoad,
}: {
	open: boolean;
	onOpenChange: (next: boolean) => void;
	doc: Document;
	onLoad: (doc: Document) => void;
}) {
	const [name, setName] = useState("");
	const [items, setItems] = useState<SavedTemplate[]>([]);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!open) return;
		listTemplates(doc.type as DocumentType)
			.then(setItems)
			.catch(() => setItems([]));
	}, [open, doc.type]);

	const refresh = async () => {
		const next = await listTemplates(doc.type as DocumentType);
		setItems(next);
	};

	const handleSave = async () => {
		const trimmed = name.trim();
		if (!trimmed) {
			toast.error("Give the template a name");
			return;
		}
		setBusy(true);
		try {
			await saveTemplate({ name: trimmed, type: doc.type, doc });
			toast.success("Template saved");
			setName("");
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Save failed");
		} finally {
			setBusy(false);
		}
	};

	const handleDelete = async (id: string) => {
		await deleteTemplate(id);
		await refresh();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Saved templates</DialogTitle>
					<DialogDescription>
						Stored privately in your browser. Load to overwrite the
						current draft.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-2">
					<Input
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder="Template name (e.g. Retainer)"
					/>
					<Button
						onClick={handleSave}
						isLoading={busy}
						className="self-start">
						Save current as template
					</Button>
				</div>

				<div className="border-border max-h-64 overflow-y-auto rounded-md border">
					{items.length === 0 ?
						<p className="text-muted-foreground p-3 text-sm">
							No templates yet for this document type.
						</p>
					:	items.map(t => (
							<div
								key={t.id}
								className="border-border flex items-center justify-between gap-2 border-b p-3 last:border-b-0">
								<div className="min-w-0">
									<div className="truncate text-sm font-medium">
										{t.name}
									</div>
									<div className="text-muted-foreground text-xs">
										Updated{" "}
										{new Date(t.updatedAt).toLocaleString()}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											onLoad(t.doc);
											onOpenChange(false);
											toast.success(`Loaded "${t.name}"`);
										}}>
										Load
									</Button>
									<Button
										size="icon"
										variant="ghost"
										onClick={() => handleDelete(t.id)}
										aria-label="Delete template">
										<Trash2 className="size-4" />
									</Button>
								</div>
							</div>
						))
					}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
