"use client";

import {
	computeTotals,
	documentNumber,
	formatMoney,
} from "@/lib/documents/compute";
import { DOC_TYPE_CONFIG } from "@/lib/documents/defaults";
import type { Document } from "@/lib/documents/schema";

export function ModernTemplate({ doc }: { doc: Document }) {
	const totals = computeTotals(doc);
	const labels = DOC_TYPE_CONFIG[doc.type].labels;
	const primary = doc.theme.primary || "#0f172a";
	const accent = doc.theme.accent || "#64748b";

	return (
		<article className="mx-auto w-full max-w-[820px] overflow-hidden rounded-xl bg-white text-[13px] leading-relaxed text-slate-900 shadow-sm print:shadow-none">
			<header
				className="flex flex-wrap items-start justify-between gap-6 p-8 text-white"
				style={{ background: primary }}>
				<div>
					{doc.company.logo ?
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={doc.company.logo}
							alt=""
							className="mb-3 max-h-12 max-w-[160px] object-contain"
						/>
					:	null}
					<div className="text-xs uppercase tracking-widest text-white/70">
						{labels.title}
					</div>
					<div className="text-3xl font-semibold tracking-tight">
						{documentNumber(doc)}
					</div>
				</div>
				<div className="text-right text-sm text-white/80">
					<div className="text-white">{doc.company.name}</div>
					<p className="whitespace-pre-line">{doc.company.address}</p>
					<p>
						{doc.company.email}
						{doc.company.email && doc.company.phone ? " · " : ""}
						{doc.company.phone}
					</p>
				</div>
			</header>

			<section className="grid gap-6 p-8 sm:grid-cols-3">
				<div className="sm:col-span-2">
					<div
						className="text-xs font-semibold uppercase tracking-widest"
						style={{ color: accent }}>
						Bill to
					</div>
					<div className="mt-1 font-semibold text-slate-800">
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
				</div>
				<dl className="space-y-1 text-slate-700 sm:text-right">
					<Row label={labels.issueDate} value={doc.meta.issueDate} />
					{labels.dueDate && doc.meta.dueDate ?
						<Row label={labels.dueDate} value={doc.meta.dueDate} />
					:	null}
					{doc.meta.customFields.map(kv => (
						<Row key={kv.id} label={kv.label} value={kv.value} />
					))}
				</dl>
			</section>

			<section className="px-8">
				<table className="w-full border-collapse text-left">
					<thead>
						<tr
							className="text-xs uppercase tracking-wider"
							style={{ color: accent }}>
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
								className="border-t border-slate-100 align-top">
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

			<section className="flex justify-end p-8">
				<dl className="w-full max-w-xs space-y-1">
					<Row
						label="Subtotal"
						value={formatMoney(totals.subtotal, doc.meta.currency)}
					/>
					{totals.discount > 0 ?
						<Row
							label={`Discount (${doc.totals.discountPercent}%)`}
							value={`- ${formatMoney(totals.discount, doc.meta.currency)}`}
						/>
					:	null}
					{totals.tax > 0 ?
						<Row
							label={`Tax (${doc.totals.taxPercent}%)`}
							value={formatMoney(totals.tax, doc.meta.currency)}
						/>
					:	null}
					<div
						className="mt-2 flex items-center justify-between rounded-md px-3 py-2 text-base font-semibold text-white"
						style={{ background: primary }}>
						<dt>{labels.totalCta}</dt>
						<dd>
							{formatMoney(totals.grandTotal, doc.meta.currency)}
						</dd>
					</div>
				</dl>
			</section>

			{(doc.notes || doc.terms || doc.meta.paymentTerms) ?
				<section className="grid gap-6 px-8 pb-8 sm:grid-cols-2">
					{doc.meta.paymentTerms ?
						<Block label="Payment terms" accent={accent}>
							<p className="whitespace-pre-line text-slate-600">
								{doc.meta.paymentTerms}
							</p>
						</Block>
					:	null}
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
				</section>
			:	null}

			{doc.company.signature ?
				<footer className="flex justify-end px-8 pb-8">
					<div className="text-right">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={doc.company.signature}
							alt="signature"
							className="ml-auto max-h-16 max-w-[180px] object-contain"
						/>
						<div className="mt-1 border-t border-slate-200 pt-1 text-xs uppercase tracking-widest text-slate-500">
							Authorised signature
						</div>
					</div>
				</footer>
			:	null}
		</article>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-end gap-3 text-sm">
			<dt className="text-slate-500">{label}</dt>
			<dd className="font-medium text-slate-800">{value}</dd>
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
