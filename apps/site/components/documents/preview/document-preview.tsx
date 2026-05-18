"use client";

import type { Document } from "@/lib/documents/schema";
import { ClassicTemplate } from "./templates/classic";
import { ModernTemplate } from "./templates/modern";

export function DocumentPreview({ doc }: { doc: Document }) {
	switch (doc.template) {
		case "modern":
			return <ModernTemplate doc={doc} />;
		case "classic":
		default:
			return <ClassicTemplate doc={doc} />;
	}
}
