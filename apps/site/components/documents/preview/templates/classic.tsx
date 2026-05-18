"use client";

import {
	computeTotals,
	documentNumber,
	formatMoney,
} from "@/lib/documents/compute";
import { DOC_TYPE_CONFIG } from "@/lib/documents/defaults";
import type { Document } from "@/lib/documents/schema";

export function ClassicTemplate({ doc }: { doc: Document }) {
	const totals = computeTotals(doc);
	const labels = DOC_TYPE_CONFIG[doc.type].labels;
	const primary = doc.theme.primary || "#0f172a";
	const accent = doc.theme.accent || "#64748b";

	return (
		<article
			className="mx-auto w-full max-w-[820px] bg-white p-10 text-[13px] leading-relaxed text-slate-900 shadow-sm print:shadow-none"
			style={{ ["--doc-primary" as never]: primary, ["--doc-accent" as never]: accent }}>
			<header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
				<div>
					{doc.company.logo ?
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={doc.company.logo}
							alt=""
							className="mb-3 max-h-16 max-w-[180px] object-contain"
						/>
					:	null}
					<h1
						className="text-2xl font-semibold"
						style={{ color: primary }}>
						{doc.company.name || "Your business"}
					</h1>
					<p className="mt-1 whitespace-pre-line text-slate-600">
						{doc.company.address}
					</p>
					<p className="text-slate-600">
						{doc.company.email}
						{doc.company.email && doc.company.phone ? " · " : ""}
						{doc.company.phone}
					</p>
					<KVList items={doc.company.customFields} />
				</div>
				<div className="text-right">
					<div
						className="text-xs font-semibold uppercase tracking-widest"
						style={{ color: accent }}>
						{labels.title}
					</div>
					<div className="text-xl font-semibold text-slate-800">
						{documentNumber(doc)}
					</div>
					<dl className="mt-4 space-y-1 text-slate-600">
						<DescRow label={labels.issueDate} value={doc.meta.issueDate} />
						{labels.dueDate && doc.meta.dueDate ?
							<DescRow
								label={labels.dueDate}
								value={doc.meta.dueDate}
							/>
						:	null}
						{doc.meta.customFields.map(kv => (
							<DescRow key={kv.id} label={kv.label} value={kv.value} />
						))}
					</dl>
				</div>
			</header>

			<section className="mt-6 grid gap-6 sm:grid-cols-2">
				<div>
					<div
						className="text-xs font-semibold uppercase tracking-widest"
						style={{ color: accent }}>
						Bill to
					</div>
					<div className="mt-1 font-medium text-slate-800">
						{doc.client.name || "Client"}
					</div>
					<p className="whitespace-pre-line text-slate-600">
						{doc.client.address}
					</p>
					<p className="text-slate-600">
						{doc.client.email}
						{doc.client.email && doc.client.phone ? " · " : ""}
						{doc.client.phone}
					</p>
					<KVList items={doc.client.customFields} />
				</div>
				<div className="sm:text-right">
					<div
						className="text-xs font-semibold uppercase tracking-widest"
						style={{ color: accent }}>
						{labels.totalCta}
					</div>
					<div
						className="text-3xl font-semibold"
						style={{ color: primary }}>
						{formatMoney(totals.grandTotal, doc.meta.currency)}
					</div>
				</div>
			</section>

			<section className="mt-8">
				<table className="w-full border-collapse text-left">
					<thead>
						<tr
							className="border-b text-xs uppercase tracking-wider text-slate-500"
							style={{ borderColor: accent }}>
							<th className="py-2 pr-4">Item</th>
							<th className="py-2 pr-4 text-right">Qty</th>
							<th className="py-2 pr-4 text-right">Price</th>
							<th className="py-2 text-right">Total</th>
						</tr>
					</thead>
					<tbody>
						{doc.items.map(item => (
							<tr
								key={item.id}
								className="border-b border-slate-100 align-top">
								<td className="py-3 pr-4">
									<div className="font-medium text-slate-800">
										{item.name}
									</div>
									{item.description ?
										<div className="text-slate-500">
											{item.description}
										</div>
									:	null}
								</td>
								<td className="py-3 pr-4 text-right">
									{item.quantity}
								</td>
								<td className="py-3 pr-4 text-right">
									{formatMoney(item.price, doc.meta.currency)}
								</td>
								<td className="py-3 text-right">
									{formatMoney(
										item.quantity * item.price,
										doc.meta.currency,
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>

			<section className="mt-4 flex justify-end">
				<dl className="w-full max-w-xs space-y-1 text-slate-700">
					<TotalRow
						label="Subtotal"
						value={formatMoney(totals.subtotal, doc.meta.currency)}
					/>
					{totals.discount > 0 ?
						<TotalRow
							label={`Discount (${doc.totals.discountPercent}%)`}
							value={`- ${formatMoney(totals.discount, doc.meta.currency)}`}
						/>
					:	null}
					{totals.tax > 0 ?
						<TotalRow
							label={`Tax (${doc.totals.taxPercent}%)`}
							value={formatMoney(totals.tax, doc.meta.currency)}
						/>
					:	null}
					<TotalRow
						label="Total"
						value={formatMoney(totals.grandTotal, doc.meta.currency)}
						emphasis
						primary={primary}
					/>
				</dl>
			</section>

			{doc.meta.paymentTerms ?
				<p className="mt-6 text-slate-600">{doc.meta.paymentTerms}</p>
			:	null}

			{(doc.notes || doc.terms || doc.extra.length > 0) ?
				<section className="mt-8 grid gap-6 sm:grid-cols-2">
					{doc.notes ?
						<Block label="Notes" accent={accent}>
							<p className="whitespace-pre-line text-slate-600">
								{doc.notes}
							</p>
						</Block>
					:	null}
					{doc.terms ?
						<Block label="Terms" accent={accent}>
							<p className="whitespace-pre-line text-slate-600">
								{doc.terms}
							</p>
						</Block>
					:	null}
					{doc.extra.length > 0 ?
						<Block label="Additional" accent={accent}>
							<KVList items={doc.extra} />
						</Block>
					:	null}
				</section>
			:	null}

			{doc.company.signature ?
				<footer className="mt-12 flex justify-end">
					<div className="text-right">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={doc.company.signature}
							alt="signature"
							className="ml-auto max-h-16 max-w-[180px] object-contain"
						/>
						<div
							className="mt-1 border-t pt-1 text-xs uppercase tracking-widest text-slate-500"
							style={{ borderColor: accent }}>
							Authorised signature
						</div>
					</div>
				</footer>
			:	null}
		</article>
	);
}

function KVList({
	items,
}: {
	items: { id: string; label: string; value: string }[];
}) {
	if (!items.length) return null;
	return (
		<dl className="mt-1 text-slate-600">
			{items.map(kv => (
				<div key={kv.id} className="flex gap-1">
					<dt className="font-medium">{kv.label}:</dt>
					<dd>{kv.value}</dd>
				</div>
			))}
		</dl>
	);
}

function DescRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-end gap-2">
			<dt className="text-slate-500">{label}</dt>
			<dd className="font-medium text-slate-800">{value}</dd>
		</div>
	);
}

function TotalRow({
	label,
	value,
	emphasis,
	primary,
}: {
	label: string;
	value: string;
	emphasis?: boolean;
	primary?: string;
}) {
	return (
		<div
			className={
				"flex items-center justify-between " +
				(emphasis ? "border-t pt-2 text-base font-semibold" : "")
			}
			style={emphasis ? { color: primary } : undefined}>
			<dt>{label}</dt>
			<dd>{value}</dd>
		</div>
	);
}

function Block({
	label,
	accent,
	children,
}: {
	label: string;
	accent: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<div
				className="text-xs font-semibold uppercase tracking-widest"
				style={{ color: accent }}>
				{label}
			</div>
			<div className="mt-1">{children}</div>
		</div>
	);
}
