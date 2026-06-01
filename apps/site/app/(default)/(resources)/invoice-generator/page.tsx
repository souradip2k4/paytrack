import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import { GeneratorShell } from "@/components/documents/generator-shell";
import { RelatedDocumentTools } from "@/components/documents/related-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Free Invoice Generator - Create & Share Invoices Online | Paytrack",
	description:
		"Free online invoice generator. Pick a template, add items, download a PDF or share a link. Multiple templates, custom fields, mobile-friendly. No signup.",
	keywords: [
		"invoice generator",
		"free invoice generator",
		"create invoice online",
		"invoice maker",
		"invoice template",
		"online invoice",
		"pdf invoice generator",
		"shareable invoice",
	],
	alternates: {
		canonical: "/invoice-generator",
	},
};

export default function InvoiceGeneratorPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
			<section className="mb-8 space-y-2 sm:mb-10">
				<h1 className="text-accent-foreground select-none text-3xl font-[Instrument_Serif] sm:text-4xl lg:text-5xl">
					Invoice Generator
				</h1>
				<p className="text-muted-foreground max-w-2xl text-base leading-7">
					Create professional invoices in minutes. Pick a template,
					customise colors, add line items, then download a PDF or
					share a link. Drafts and templates stay on your device.
				</p>
			</section>

			<GeneratorShell type="invoice" />

			<section className="mt-14 space-y-6">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					What goes into a good invoice
				</h2>
				<div className="text-muted-foreground space-y-4 text-base leading-7">
					<p>
						Every invoice should clearly identify both parties, list
						line items with quantities and prices, show subtotal,
						tax and the final amount due, and include a payment
						deadline. Adding a unique invoice number and date helps
						with bookkeeping on both sides.
					</p>
					<p>
						Save the doc as a template once and the next invoice for
						the same client takes seconds. Use the share link to
						send a lightweight preview without an email attachment.
					</p>
				</div>
			</section>

			<RelatedDocumentTools current="invoice" />

			<CTACardOne
				title="Track invoices alongside your spending"
				description="Paytrack helps you keep income, expenses and pending payments in one clean view."
			/>
		</div>
	);
}
