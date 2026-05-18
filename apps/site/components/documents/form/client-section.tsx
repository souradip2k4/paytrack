"use client";

import { Input } from "@budgetbee/ui/core/input";
import { Textarea } from "@budgetbee/ui/core/textarea";
import { useDocument } from "../document-context";
import { CustomFieldsEditor } from "./custom-fields";
import { Field, SectionCard } from "./field";

export function ClientSection() {
	const { doc, setDoc } = useDocument();
	const update = <K extends keyof typeof doc.client>(
		key: K,
		value: (typeof doc.client)[K],
	) =>
		setDoc(prev => ({
			...prev,
			client: { ...prev.client, [key]: value },
		}));

	return (
		<SectionCard title="Bill to" description="Who is this document for?">
			<Field label="Client name">
				<Input
					value={doc.client.name}
					onChange={e => update("name", e.target.value)}
					placeholder="Beta Corp Pvt Ltd"
				/>
			</Field>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Email">
					<Input
						type="email"
						value={doc.client.email}
						onChange={e => update("email", e.target.value)}
						placeholder="accounts@beta.com"
					/>
				</Field>
				<Field label="Phone">
					<Input
						value={doc.client.phone}
						onChange={e => update("phone", e.target.value)}
					/>
				</Field>
			</div>
			<Field label="Address">
				<Textarea
					value={doc.client.address}
					onChange={e => update("address", e.target.value)}
					rows={3}
				/>
			</Field>
			<Field label="Custom fields">
				<CustomFieldsEditor
					value={doc.client.customFields}
					onChange={next => update("customFields", next)}
				/>
			</Field>
		</SectionCard>
	);
}
