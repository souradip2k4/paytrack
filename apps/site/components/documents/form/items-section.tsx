"use client";

import { Button } from "@budgetbee/ui/core/button";
import { Input } from "@budgetbee/ui/core/input";
import { Textarea } from "@budgetbee/ui/core/textarea";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { newItem } from "@/lib/documents/defaults";
import type { DocumentItem } from "@/lib/documents/schema";
import { computeTotals, formatMoney } from "@/lib/documents/compute";
import { useDocument } from "../document-context";
import { Field, SectionCard } from "./field";

export function ItemsSection() {
	const { doc, setDoc } = useDocument();
	const totals = computeTotals(doc);

	const updateItem = (id: string, patch: Partial<DocumentItem>) =>
		setDoc(prev => ({
			...prev,
			items: prev.items.map(it =>
				it.id === id ? { ...it, ...patch } : it,
			),
		}));
	const remove = (id: string) =>
		setDoc(prev => ({
			...prev,
			items: prev.items.filter(it => it.id !== id),
		}));
	const add = () =>
		setDoc(prev => ({ ...prev, items: [...prev.items, newItem()] }));
	const move = (id: string, dir: -1 | 1) =>
		setDoc(prev => {
			const idx = prev.items.findIndex(it => it.id === id);
			const target = idx + dir;
			if (idx < 0 || target < 0 || target >= prev.items.length)
				return prev;
			const next = [...prev.items];
			[next[idx], next[target]] = [next[target]!, next[idx]!];
			return { ...prev, items: next };
		});
	const updateTotals = (patch: Partial<typeof doc.totals>) =>
		setDoc(prev => ({
			...prev,
			totals: { ...prev.totals, ...patch },
		}));

	return (
		<SectionCard title="Items">
			<div className="flex flex-col gap-3">
				{doc.items.map((item, idx) => {
					const lineTotal = item.quantity * item.price;
					return (
						<div
							key={item.id}
							className="border-border bg-background flex flex-col gap-2 rounded-xl border p-3">
							<div className="flex items-start gap-2">
								<Input
									value={item.name}
									onChange={e =>
										updateItem(item.id, {
											name: e.target.value,
										})
									}
									placeholder="Item name"
									className="flex-1"
								/>
								<div className="flex items-center gap-1">
									<Button
										type="button"
										size="icon"
										variant="ghost"
										onClick={() => move(item.id, -1)}
										disabled={idx === 0}
										aria-label="Move up">
										<ChevronUp className="size-4" />
									</Button>
									<Button
										type="button"
										size="icon"
										variant="ghost"
										onClick={() => move(item.id, 1)}
										disabled={idx === doc.items.length - 1}
										aria-label="Move down">
										<ChevronDown className="size-4" />
									</Button>
									<Button
										type="button"
										size="icon"
										variant="ghost"
										onClick={() => remove(item.id)}
										disabled={doc.items.length === 1}
										aria-label="Remove item">
										<X className="size-4" />
									</Button>
								</div>
							</div>
							<Textarea
								value={item.description}
								onChange={e =>
									updateItem(item.id, {
										description: e.target.value,
									})
								}
								placeholder="Description (optional)"
								rows={2}
							/>
							<div className="grid grid-cols-3 gap-2 text-sm">
								<Field label="Qty">
									<Input
										type="number"
										min={0}
										step="0.01"
										value={item.quantity}
										onChange={e =>
											updateItem(item.id, {
												quantity:
													Number(e.target.value) || 0,
											})
										}
									/>
								</Field>
								<Field label="Price">
									<Input
										type="number"
										min={0}
										step="0.01"
										value={item.price}
										onChange={e =>
											updateItem(item.id, {
												price:
													Number(e.target.value) || 0,
											})
										}
									/>
								</Field>
								<Field label="Line total">
									<div className="border-input flex h-9 items-center rounded-md border bg-transparent px-3 text-sm">
										{formatMoney(lineTotal, doc.meta.currency)}
									</div>
								</Field>
							</div>
						</div>
					);
				})}
				<Button
					type="button"
					size="sm"
					variant="outline"
					onClick={add}
					className="self-start">
					<Plus className="size-3.5" />
					Add item
				</Button>
			</div>
			<div className="border-border mt-2 grid gap-3 border-t pt-4 sm:grid-cols-2">
				<Field label="Discount %">
					<Input
						type="number"
						min={0}
						max={100}
						step="0.01"
						value={doc.totals.discountPercent}
						onChange={e =>
							updateTotals({
								discountPercent: Number(e.target.value) || 0,
							})
						}
					/>
				</Field>
				<Field label="Tax %">
					<Input
						type="number"
						min={0}
						max={100}
						step="0.01"
						value={doc.totals.taxPercent}
						onChange={e =>
							updateTotals({
								taxPercent: Number(e.target.value) || 0,
							})
						}
					/>
				</Field>
			</div>
			<dl className="text-foreground/80 mt-2 grid gap-1 text-sm">
				<Row
					label="Subtotal"
					value={formatMoney(totals.subtotal, doc.meta.currency)}
				/>
				{totals.discount > 0 ?
					<Row
						label="Discount"
						value={`- ${formatMoney(totals.discount, doc.meta.currency)}`}
					/>
				:	null}
				{totals.tax > 0 ?
					<Row
						label="Tax"
						value={formatMoney(totals.tax, doc.meta.currency)}
					/>
				:	null}
				<Row
					label="Total"
					value={formatMoney(totals.grandTotal, doc.meta.currency)}
					emphasis
				/>
			</dl>
		</SectionCard>
	);
}

function Row({
	label,
	value,
	emphasis,
}: {
	label: string;
	value: string;
	emphasis?: boolean;
}) {
	return (
		<div
			className={
				"flex items-center justify-between " +
				(emphasis ?
					"text-foreground border-border mt-1 border-t pt-2 text-base font-semibold"
				:	"text-muted-foreground")
			}>
			<dt>{label}</dt>
			<dd>{value}</dd>
		</div>
	);
}
