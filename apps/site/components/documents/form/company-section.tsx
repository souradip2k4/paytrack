"use client";

import { Input } from "@budgetbee/ui/core/input";
import { Textarea } from "@budgetbee/ui/core/textarea";
import { useDocument } from "../document-context";
import { CustomFieldsEditor } from "./custom-fields";
import { Field, SectionCard } from "./field";
import { ImageInput } from "./image-input";

export function CompanySection() {
	const { doc, setDoc } = useDocument();
	const update = <K extends keyof typeof doc.company>(
		key: K,
		value: (typeof doc.company)[K],
	) =>
		setDoc(prev => ({
			...prev,
			company: { ...prev.company, [key]: value },
		}));

	return (
		<SectionCard
			title="Your business"
			description="Shown at the top of the document.">
			<Field label="Business name">
				<Input
					value={doc.company.name}
					onChange={e => update("name", e.target.value)}
					placeholder="Acme Studios LLP"
				/>
			</Field>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Email">
					<Input
						type="email"
						value={doc.company.email}
						onChange={e => update("email", e.target.value)}
						placeholder="hello@acme.com"
					/>
				</Field>
				<Field label="Phone">
					<Input
						value={doc.company.phone}
						onChange={e => update("phone", e.target.value)}
						placeholder="+91 90000 00000"
					/>
				</Field>
			</div>
			<Field label="Address">
				<Textarea
					value={doc.company.address}
					onChange={e => update("address", e.target.value)}
					placeholder="Street, City, State, PIN"
					rows={3}
				/>
			</Field>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Logo">
					<ImageInput
						label="logo"
						value={doc.company.logo}
						onChange={v => update("logo", v)}
					/>
				</Field>
				<Field label="Signature">
					<ImageInput
						label="signature"
						value={doc.company.signature}
						onChange={v => update("signature", v)}
					/>
				</Field>
			</div>
			<Field label="Custom fields">
				<CustomFieldsEditor
					value={doc.company.customFields}
					onChange={next => update("customFields", next)}
					addLabel="Add field (e.g. GSTIN)"
				/>
			</Field>
		</SectionCard>
	);
}
