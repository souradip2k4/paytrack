"use client";

import { Button } from "@budgetbee/ui/core/button";
import { Input } from "@budgetbee/ui/core/input";
import { Plus, X } from "lucide-react";
import type { KV } from "@/lib/documents/schema";
import { newKV } from "@/lib/documents/defaults";

export function CustomFieldsEditor({
	value,
	onChange,
	addLabel = "Add field",
}: {
	value: KV[];
	onChange: (next: KV[]) => void;
	addLabel?: string;
}) {
	const update = (id: string, patch: Partial<KV>) =>
		onChange(value.map(kv => (kv.id === id ? { ...kv, ...patch } : kv)));
	const remove = (id: string) =>
		onChange(value.filter(kv => kv.id !== id));
	const add = () => onChange([...value, newKV()]);

	return (
		<div className="flex flex-col gap-2">
			{value.map(kv => (
				<div key={kv.id} className="flex items-center gap-2">
					<Input
						value={kv.label}
						onChange={e => update(kv.id, { label: e.target.value })}
						placeholder="Label"
						className="w-1/3"
					/>
					<Input
						value={kv.value}
						onChange={e => update(kv.id, { value: e.target.value })}
						placeholder="Value"
						className="flex-1"
					/>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						onClick={() => remove(kv.id)}
						aria-label="Remove field">
						<X className="size-4" />
					</Button>
				</div>
			))}
			<Button
				type="button"
				size="sm"
				variant="outline"
				onClick={add}
				className="self-start">
				<Plus className="size-3.5" />
				{addLabel}
			</Button>
		</div>
	);
}
