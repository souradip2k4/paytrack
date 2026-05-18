"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Document } from "@/lib/documents/schema";
import { DOC_TYPE_CONFIG } from "@/lib/documents/defaults";

type DocumentContextValue = {
	doc: Document;
	setDoc: (updater: (prev: Document) => Document) => void;
	patch: (partial: Partial<Document>) => void;
	labels: (typeof DOC_TYPE_CONFIG)[Document["type"]]["labels"];
	readOnly: boolean;
};

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({
	doc,
	setDoc,
	readOnly = false,
	children,
}: {
	doc: Document;
	setDoc: (updater: (prev: Document) => Document) => void;
	readOnly?: boolean;
	children: ReactNode;
}) {
	const value = useMemo<DocumentContextValue>(
		() => ({
			doc,
			setDoc,
			patch: partial => setDoc(prev => ({ ...prev, ...partial })),
			labels: DOC_TYPE_CONFIG[doc.type].labels,
			readOnly,
		}),
		[doc, setDoc, readOnly],
	);
	return (
		<DocumentContext.Provider value={value}>
			{children}
		</DocumentContext.Provider>
	);
}

export function useDocument(): DocumentContextValue {
	const ctx = useContext(DocumentContext);
	if (!ctx)
		throw new Error("useDocument must be inside DocumentProvider");
	return ctx;
}
