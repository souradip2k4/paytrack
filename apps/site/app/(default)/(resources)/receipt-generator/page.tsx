import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import { GeneratorShell } from "@/components/documents/generator-shell";
import { RelatedDocumentTools } from "@/components/documents/related-tools";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Free Receipt Generator - Create & Share Receipts Online | Paytrack",
	description:
		"Create payment receipts online for free. Choose a template, add items, download as PDF or share a link. No signup required.",
	keywords: [
		"receipt generator",
		"free receipt maker",
		"payment receipt template",
		"online receipt generator",
		"cash receipt template",
		"pdf receipt generator",
	],
	alternates: {
		canonical: "/receipt-generator",
	},
};

export default function ReceiptGeneratorPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
			<section className="mb-8 space-y-2 sm:mb-10">
				<h1 className="text-accent-foreground select-none text-3xl font-[Instrument_Serif] sm:text-4xl lg:text-5xl">
					Receipt Generator
				</h1>
				<p className="text-muted-foreground max-w-2xl text-base leading-7">
					Issue a clean payment receipt in seconds. Add your business
					details, the items paid for, and download a PDF or share a
					link with the customer.
				</p>
			</section>

			<GeneratorShell type="receipt" />

			<section className="mt-14 space-y-6">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					Receipts vs invoices
				</h2>
				<div className="text-muted-foreground space-y-4 text-base leading-7">
					<p>
						A receipt is proof that payment has been received.
						Unlike an invoice, it usually omits due dates and
						payment terms. This generator hides those fields
						automatically while keeping line items, taxes and a
						running total.
					</p>
				</div>
			</section>

			<RelatedDocumentTools current="receipt" />

			<CTACardOne
				title="Keep your business cash flow tidy"
				description="Track payments received and spending without juggling spreadsheets."
			/>
		</div>
	);
}
