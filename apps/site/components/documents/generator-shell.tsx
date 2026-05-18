"use client";

import { Button } from "@budgetbee/ui/core/button";
import { cn } from "@budgetbee/ui/lib/utils";
import { useIsMobile } from "@budgetbee/ui/hooks/use-mobile";
import {
	BookmarkPlus,
	Download,
	FileText,
	Layers,
	Link as LinkIcon,
	Pencil,
	RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	createEmptyDocument,
	DOC_TYPE_CONFIG,
} from "@/lib/documents/defaults";
import {
	clearDraft,
	loadDraft,
	saveDraft,
} from "@/lib/documents/storage";
import type { Document, DocumentType } from "@/lib/documents/schema";
import { DocumentProvider } from "./document-context";
import { DocumentForm } from "./form/document-form";
import { DocumentPreview } from "./preview/document-preview";
import { ShareDialog } from "./share-dialog";
import { TemplatesDialog } from "./templates-dialog";

type ViewMode = "form" | "preview" | "both";

const MODES: { id: ViewMode; label: string }[] = [
	{ id: "form", label: "Form" },
	{ id: "preview", label: "Preview" },
	{ id: "both", label: "Both" },
];

const VIEW_MODE_KEY = "budgetbee.doc.viewMode";

function readStoredMode(fallback: ViewMode): ViewMode {
	if (typeof window === "undefined") return fallback;
	const stored = window.localStorage.getItem(VIEW_MODE_KEY) as ViewMode | null;
	return stored && MODES.some(m => m.id === stored) ? stored : fallback;
}

export function GeneratorShell({ type }: { type: DocumentType }) {
	const [doc, setDoc] = useState<Document>(() => createEmptyDocument(type));
	const [hydrated, setHydrated] = useState(false);
	const isMobile = useIsMobile();
	const [mode, setMode] = useState<ViewMode>(() =>
		readStoredMode("both"),
	);
	const [templatesOpen, setTemplatesOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		let cancelled = false;
		loadDraft(type)
			.then(draft => {
				if (!cancelled && draft) setDoc(draft);
			})
			.catch(() => {})
			.finally(() => {
				if (!cancelled) setHydrated(true);
			});
		return () => {
			cancelled = true;
		};
	}, [type]);

	useEffect(() => {
		if (!hydrated) return;
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => {
			saveDraft(type, doc).catch(() => {});
		}, 500);
		return () => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
		};
	}, [doc, hydrated, type]);

	useEffect(() => {
		if (isMobile && mode === "both") {
			setMode("form");
		}
	}, [isMobile, mode]);

	const updateMode = useCallback((next: ViewMode) => {
		setMode(next);
		try {
			window.localStorage.setItem(VIEW_MODE_KEY, next);
		} catch {}
	}, []);

	const onReset = () => {
		if (!confirm("Discard the current draft and start over?")) return;
		const fresh = createEmptyDocument(type);
		setDoc(fresh);
		clearDraft(type).catch(() => {});
		toast.success("Draft cleared");
	};

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

	const handleSetDoc = useCallback(
		(updater: (prev: Document) => Document) => setDoc(updater),
		[],
	);

	const showForm = mode === "form" || mode === "both";
	const showPreview = mode === "preview" || mode === "both";

	const layoutClass = useMemo(() => {
		if (mode === "both")
			return "grid gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]";
		return "grid gap-6 grid-cols-1";
	}, [mode]);

	return (
		<DocumentProvider doc={doc} setDoc={handleSetDoc}>
			<div className="border-border bg-card sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:rounded-2xl sm:border sm:px-4 sm:-mx-0 sm:static sm:top-auto">
				<div className="flex flex-wrap items-center gap-2">
					<ModeToggle mode={mode} onChange={updateMode} />
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setTemplatesOpen(true)}>
						<BookmarkPlus className="size-4" />
						<span className="hidden sm:inline">Templates</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShareOpen(true)}>
						<LinkIcon className="size-4" />
						<span className="hidden sm:inline">Share</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onReset}
						title="Reset draft">
						<RotateCcw className="size-4" />
					</Button>
					<Button
						size="sm"
						onClick={onDownload}
						isLoading={downloading}>
						<Download className="size-4" />
						PDF
					</Button>
				</div>
			</div>

			<div className={layoutClass}>
				{showForm ?
					<div
						className={cn(
							"min-w-0",
							mode === "both" ?
								"lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2"
							:	"",
						)}>
						<DocumentForm />
					</div>
				:	null}
				{showPreview ?
					<div className="bg-muted/40 border-border min-w-0 rounded-3xl border p-2 sm:p-4">
						<div className="overflow-x-auto">
							<div className="min-w-[640px] sm:min-w-0">
								<DocumentPreview doc={doc} />
							</div>
						</div>
					</div>
				:	null}
			</div>

			<TemplatesDialog
				open={templatesOpen}
				onOpenChange={setTemplatesOpen}
				doc={doc}
				onLoad={loaded => setDoc({ ...loaded, type })}
			/>
			<ShareDialog
				open={shareOpen}
				onOpenChange={setShareOpen}
				doc={doc}
			/>
		</DocumentProvider>
	);
}

function ModeToggle({
	mode,
	onChange,
}: {
	mode: ViewMode;
	onChange: (next: ViewMode) => void;
}) {
	return (
		<div
			className="border-border bg-background inline-flex items-center rounded-md border p-0.5 text-sm"
			role="tablist"
			aria-label="View mode">
			{MODES.map(m => {
				const active = m.id === mode;
				const icon =
					m.id === "form" ? <Pencil className="size-3.5" />
					: m.id === "preview" ? <FileText className="size-3.5" />
					: <Layers className="size-3.5" />;
				return (
					<button
						key={m.id}
						type="button"
						role="tab"
						aria-selected={active}
						onClick={() => onChange(m.id)}
						className={cn(
							"inline-flex items-center gap-1.5 rounded px-2.5 py-1 transition-colors",
							active ?
								"bg-foreground text-background"
							:	"text-muted-foreground hover:bg-muted",
						)}>
						{icon}
						<span>{m.label}</span>
					</button>
				);
			})}
		</div>
	);
}
