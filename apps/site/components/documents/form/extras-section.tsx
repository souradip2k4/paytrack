"use client";

import { Textarea } from "@budgetbee/ui/core/textarea";
import { useDocument } from "../document-context";
import { CustomFieldsEditor } from "./custom-fields";
import { Field, SectionCard } from "./field";

export function ExtrasSection() {
	const { doc, setDoc } = useDocument();

	return (
		<SectionCard title="Notes & terms">
			<Field label="Notes">
				<Textarea
					value={doc.notes}
					onChange={e =>
						setDoc(prev => ({ ...prev, notes: e.target.value }))
					}
					rows={3}
					placeholder="Thanks for your business!"
				/>
			</Field>
			<Field label="Terms">
				<Textarea
					value={doc.terms}
					onChange={e =>
						setDoc(prev => ({ ...prev, terms: e.target.value }))
					}
					rows={3}
					placeholder="Payment terms, late fees, refund policy..."
				/>
			</Field>
			<Field label="Additional info">
				<CustomFieldsEditor
					value={doc.extra}
					onChange={next =>
						setDoc(prev => ({ ...prev, extra: next }))
					}
				/>
			</Field>
		</SectionCard>
	);
}
