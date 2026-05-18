import { GeneratorShell } from "@/components/documents/generator-shell";
import { RelatedDocumentTools } from "@/components/documents/related-tools";
import { CTACardOne } from "@/components/currency-converter/tool-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Free Estimate Generator - Send Quotes Online | Budgetbee",
	description:
		"Create quick, professional estimates and quotes. Multiple templates, custom fields, mobile-friendly. Download as PDF or share a link.",
	keywords: [
		"estimate generator",
		"quote generator",
		"free estimate template",
		"online quote maker",
		"contractor estimate template",
		"pdf estimate generator",
	],
	alternates: {
		canonical: "/estimate-generator",
	},
};

export default function EstimateGeneratorPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
			<section className="mb-8 space-y-2 sm:mb-10">
				<h1 className="text-accent-foreground select-none text-3xl font-[Instrument_Serif] sm:text-4xl lg:text-5xl">
					Estimate Generator
				</h1>
				<p className="text-muted-foreground max-w-2xl text-base leading-7">
					Send polished estimates and quotes in minutes. Line up the
					scope and pricing, set a validity date, and share a link or
					PDF with the client.
				</p>
			</section>

			<GeneratorShell type="estimate" />

			<section className="mt-14 space-y-6">
				<h2 className="text-accent-foreground text-2xl font-[Instrument_Serif] sm:text-3xl">
					Turning an estimate into an invoice
				</h2>
				<div className="text-muted-foreground space-y-4 text-base leading-7">
					<p>
						Once the client approves the estimate, save it as a
						template and open the invoice generator with the same
						items. The shared schema keeps everything consistent so
						numbers never drift between documents.
					</p>
				</div>
			</section>

			<RelatedDocumentTools current="estimate" />

			<CTACardOne
				title="Stop chasing payments from a spreadsheet"
				description="Budgetbee gives you one home for income, spend, and pending receivables."
			/>
		</div>
	);
}
