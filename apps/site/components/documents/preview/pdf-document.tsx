"use client";

import {
	Document as PDFDocument,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import {
	computeTotals,
	documentNumber,
	formatMoney,
} from "@/lib/documents/compute";
import { DOC_TYPE_CONFIG } from "@/lib/documents/defaults";
import type { Document } from "@/lib/documents/schema";

const PALE = "#f1f5f9";
const BORDER = "#e2e8f0";
const MUTED = "#64748b";
const TEXT = "#0f172a";

const styles = StyleSheet.create({
	page: {
		padding: 36,
		fontSize: 10,
		fontFamily: "Helvetica",
		color: TEXT,
	},
	row: { flexDirection: "row" },
	spaceBetween: { flexDirection: "row", justifyContent: "space-between" },
	headerLeft: { flex: 1 },
	headerRight: { textAlign: "right" },
	logo: { maxHeight: 50, maxWidth: 140, marginBottom: 8 },
	companyName: { fontSize: 14, fontWeight: 700 },
	muted: { color: MUTED },
	docKind: {
		fontSize: 9,
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
	docNumber: { fontSize: 14, fontWeight: 700, marginTop: 2 },
	hr: { borderBottomWidth: 1, borderColor: BORDER, marginVertical: 12 },
	sectionGap: { marginTop: 14 },
	twoCol: { flexDirection: "row", justifyContent: "space-between" },
	col: { width: "48%" },
	label: { fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
	value: { fontSize: 10, marginTop: 2 },
	tableHeader: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderColor: BORDER,
		paddingBottom: 4,
		marginBottom: 4,
	},
	th: { fontSize: 9, color: MUTED, textTransform: "uppercase", letterSpacing: 1 },
	tr: {
		flexDirection: "row",
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderColor: PALE,
	},
	cName: { flex: 4, paddingRight: 6 },
	cQty: { flex: 1, textAlign: "right", paddingRight: 6 },
	cPrice: { flex: 1.4, textAlign: "right", paddingRight: 6 },
	cTotal: { flex: 1.4, textAlign: "right" },
	totalsBox: {
		marginTop: 12,
		marginLeft: "auto",
		width: 240,
	},
	totalsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 2,
	},
	grandRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingVertical: 6,
		paddingHorizontal: 8,
		marginTop: 4,
		borderRadius: 4,
		color: "#ffffff",
	},
	grandLabel: { fontSize: 11, fontWeight: 700 },
	footerBlock: { marginTop: 10 },
	signatureBox: { marginTop: 24, alignItems: "flex-end" },
	signature: { maxHeight: 60, maxWidth: 160 },
	signatureCaption: {
		marginTop: 4,
		fontSize: 8,
		color: MUTED,
		textTransform: "uppercase",
		letterSpacing: 1,
	},
});

export function DocumentPDF({ doc }: { doc: Document }) {
	const totals = computeTotals(doc);
	const labels = DOC_TYPE_CONFIG[doc.type].labels;
	const primary = doc.theme.primary || TEXT;
	const accent = doc.theme.accent || MUTED;
	const isModern = doc.template === "modern";
	const itemDescStyle = { color: MUTED, fontSize: 9, marginTop: 2 };

	const kv = (
		items: { id: string; label: string; value: string }[],
	) =>
		items.map(it => (
			<Text key={it.id} style={styles.muted}>
				<Text style={{ color: TEXT, fontWeight: 700 }}>
					{it.label}:{" "}
				</Text>
				{it.value}
			</Text>
		));

	return (
		<PDFDocument>
			<Page size="A4" style={styles.page}>
				{isModern ?
					<View
						style={{
							backgroundColor: primary,
							padding: 18,
							margin: -36,
							marginBottom: 18,
							color: "#ffffff",
						}}>
						<View style={styles.spaceBetween}>
							<View style={styles.headerLeft}>
								{doc.company.logo ?
									<Image
										src={doc.company.logo}
										style={styles.logo}
									/>
								:	null}
								<Text style={{ color: "#ffffffaa", ...styles.docKind }}>
									{labels.title}
								</Text>
								<Text style={{ color: "#ffffff", ...styles.docNumber }}>
									{documentNumber(doc)}
								</Text>
							</View>
							<View style={styles.headerRight}>
								<Text style={{ color: "#ffffff" }}>
									{doc.company.name}
								</Text>
								<Text style={{ color: "#ffffffcc" }}>
									{doc.company.address}
								</Text>
								<Text style={{ color: "#ffffffcc" }}>
									{[doc.company.email, doc.company.phone]
										.filter(Boolean)
										.join(" · ")}
								</Text>
							</View>
						</View>
					</View>
				:	<View style={styles.spaceBetween}>
						<View style={styles.headerLeft}>
							{doc.company.logo ?
								<Image src={doc.company.logo} style={styles.logo} />
							:	null}
							<Text style={{ ...styles.companyName, color: primary }}>
								{doc.company.name || "Your business"}
							</Text>
							<Text style={styles.muted}>{doc.company.address}</Text>
							<Text style={styles.muted}>
								{[doc.company.email, doc.company.phone]
									.filter(Boolean)
									.join(" · ")}
							</Text>
							{kv(doc.company.customFields)}
						</View>
						<View style={styles.headerRight}>
							<Text style={{ ...styles.docKind, color: accent }}>
								{labels.title}
							</Text>
							<Text style={styles.docNumber}>
								{documentNumber(doc)}
							</Text>
							<View style={{ marginTop: 6 }}>
								<KVRight
									label={labels.issueDate}
									value={doc.meta.issueDate}
								/>
								{labels.dueDate && doc.meta.dueDate ?
									<KVRight
										label={labels.dueDate}
										value={doc.meta.dueDate}
									/>
								:	null}
								{doc.meta.customFields.map(item => (
									<KVRight
										key={item.id}
										label={item.label}
										value={item.value}
									/>
								))}
							</View>
						</View>
					</View>
				}

				{!isModern ? <View style={styles.hr} /> : null}

				<View style={styles.twoCol}>
					<View style={styles.col}>
						<Text style={{ ...styles.label, color: accent }}>Bill to</Text>
						<Text style={{ ...styles.value, fontWeight: 700 }}>
							{doc.client.name || "Client"}
						</Text>
						<Text style={styles.muted}>{doc.client.address}</Text>
						<Text style={styles.muted}>
							{[doc.client.email, doc.client.phone]
								.filter(Boolean)
								.join(" · ")}
						</Text>
						{kv(doc.client.customFields)}
					</View>
					{isModern ?
						<View style={styles.col}>
							<KVRight
								label={labels.issueDate}
								value={doc.meta.issueDate}
							/>
							{labels.dueDate && doc.meta.dueDate ?
								<KVRight
									label={labels.dueDate}
									value={doc.meta.dueDate}
								/>
							:	null}
							{doc.meta.customFields.map(item => (
								<KVRight
									key={item.id}
									label={item.label}
									value={item.value}
								/>
							))}
						</View>
					:	<View style={[styles.col, { alignItems: "flex-end" }]}>
							<Text style={{ ...styles.label, color: accent }}>
								{labels.totalCta}
							</Text>
							<Text
								style={{
									fontSize: 18,
									fontWeight: 700,
									color: primary,
									marginTop: 2,
								}}>
								{formatMoney(totals.grandTotal, doc.meta.currency)}
							</Text>
						</View>
					}
				</View>

				<View style={styles.sectionGap}>
					<View style={styles.tableHeader}>
						<Text style={[styles.th, styles.cName, { color: accent }]}>
							Item
						</Text>
						<Text style={[styles.th, styles.cQty, { color: accent }]}>
							Qty
						</Text>
						<Text style={[styles.th, styles.cPrice, { color: accent }]}>
							Price
						</Text>
						<Text style={[styles.th, styles.cTotal, { color: accent }]}>
							Total
						</Text>
					</View>
					{doc.items.map(item => (
						<View key={item.id} style={styles.tr} wrap={false}>
							<View style={styles.cName}>
								<Text style={{ fontWeight: 700 }}>{item.name}</Text>
								{item.description ?
									<Text style={itemDescStyle}>
										{item.description}
									</Text>
								:	null}
							</View>
							<Text style={styles.cQty}>{item.quantity}</Text>
							<Text style={styles.cPrice}>
								{formatMoney(item.price, doc.meta.currency)}
							</Text>
							<Text style={styles.cTotal}>
								{formatMoney(
									item.quantity * item.price,
									doc.meta.currency,
								)}
							</Text>
						</View>
					))}
				</View>

				<View style={styles.totalsBox}>
					<View style={styles.totalsRow}>
						<Text style={styles.muted}>Subtotal</Text>
						<Text>
							{formatMoney(totals.subtotal, doc.meta.currency)}
						</Text>
					</View>
					{totals.discount > 0 ?
						<View style={styles.totalsRow}>
							<Text style={styles.muted}>
								Discount ({doc.totals.discountPercent}%)
							</Text>
							<Text>
								- {formatMoney(totals.discount, doc.meta.currency)}
							</Text>
						</View>
					:	null}
					{totals.tax > 0 ?
						<View style={styles.totalsRow}>
							<Text style={styles.muted}>
								Tax ({doc.totals.taxPercent}%)
							</Text>
							<Text>
								{formatMoney(totals.tax, doc.meta.currency)}
							</Text>
						</View>
					:	null}
					<View style={[styles.grandRow, { backgroundColor: primary }]}>
						<Text style={styles.grandLabel}>{labels.totalCta}</Text>
						<Text style={styles.grandLabel}>
							{formatMoney(totals.grandTotal, doc.meta.currency)}
						</Text>
					</View>
				</View>

				{doc.meta.paymentTerms ?
					<View style={styles.footerBlock}>
						<Text style={{ ...styles.label, color: accent }}>
							Payment terms
						</Text>
						<Text style={styles.muted}>{doc.meta.paymentTerms}</Text>
					</View>
				:	null}
				{doc.notes ?
					<View style={styles.footerBlock}>
						<Text style={{ ...styles.label, color: accent }}>Notes</Text>
						<Text style={styles.muted}>{doc.notes}</Text>
					</View>
				:	null}
				{doc.terms ?
					<View style={styles.footerBlock}>
						<Text style={{ ...styles.label, color: accent }}>Terms</Text>
						<Text style={styles.muted}>{doc.terms}</Text>
					</View>
				:	null}
				{doc.extra.length > 0 ?
					<View style={styles.footerBlock}>
						<Text style={{ ...styles.label, color: accent }}>
							Additional
						</Text>
						{kv(doc.extra)}
					</View>
				:	null}

				{doc.company.signature ?
					<View style={styles.signatureBox}>
						<Image
							src={doc.company.signature}
							style={styles.signature}
						/>
						<Text style={styles.signatureCaption}>
							Authorised signature
						</Text>
					</View>
				:	null}
			</Page>
		</PDFDocument>
	);
}

function KVRight({ label, value }: { label: string; value: string }) {
	return (
		<View
			style={{
				flexDirection: "row",
				justifyContent: "flex-end",
				gap: 6,
			}}>
			<Text style={{ color: MUTED }}>{label}</Text>
			<Text style={{ fontWeight: 700 }}>{value}</Text>
		</View>
	);
}
