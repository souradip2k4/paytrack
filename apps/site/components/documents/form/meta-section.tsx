"use client";

import { Input } from "@budgetbee/ui/core/input";
import { Textarea } from "@budgetbee/ui/core/textarea";
import { useDocument } from "../document-context";
import { CustomFieldsEditor } from "./custom-fields";
import { Field, SectionCard } from "./field";

const CURRENCIES = [
	"INR",
	"USD",
	"EUR",
	"GBP",
	"AUD",
	"CAD",
	"SGD",
	"JPY",
	"AED",
];

export function MetaSection() {
	const { doc, setDoc, labels } = useDocument();
	const update = <K extends keyof typeof doc.meta>(
		key: K,
		value: (typeof doc.meta)[K],
	) =>
		setDoc(prev => ({ ...prev, meta: { ...prev.meta, [key]: value } }));

	return (
		<SectionCard title="Document details">
			<div className="grid gap-3 sm:grid-cols-2">
				<Field label="Prefix">
					<Input
						value={doc.meta.prefix}
						onChange={e => update("prefix", e.target.value)}
						placeholder="INV-"
					/>
				</Field>
				<Field label={labels.number}>
					<Input
						value={doc.meta.serial}
						onChange={e => update("serial", e.target.value)}
						placeholder="0001"
					/>
				</Field>
				<Field label={labels.issueDate}>
					<Input
						type="date"
						value={doc.meta.issueDate}
						onChange={e => update("issueDate", e.target.value)}
					/>
				</Field>
				{labels.dueDate ?
					<Field label={labels.dueDate}>
						<Input
							type="date"
							value={doc.meta.dueDate}
							onChange={e => update("dueDate", e.target.value)}
						/>
					</Field>
				:	null}
				<Field label="Currency">
					<select
						value={doc.meta.currency}
						onChange={e => update("currency", e.target.value)}
						className="border-input bg-background h-9 rounded-md border px-3 text-sm">
						{CURRENCIES.map(c => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
				</Field>
			</div>
			{doc.type !== "receipt" ?
				<Field label="Payment terms">
					<Textarea
						value={doc.meta.paymentTerms}
						onChange={e => update("paymentTerms", e.target.value)}
						rows={2}
					/>
				</Field>
			:	null}
			<Field label="Custom fields">
				<CustomFieldsEditor
					value={doc.meta.customFields}
					onChange={next => update("customFields", next)}
				/>
			</Field>
		</SectionCard>
	);
}
