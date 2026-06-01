import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@budgetbee/ui/core/sonner";
import "@budgetbee/ui/globals.css";
import { cn } from "@budgetbee/ui/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import React from "react";

const instrumentSerif = Instrument_Serif({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-instrument-serif",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const title = "Paytrack";
const description = "Simple, user-friendly, minimal expense tracker.";
const url = "https://paytrack-site-prod.vercel.app";

export const metadata: Metadata = {
	title,
	description,
	keywords:
		"budgetbee, budget, expense, tracker, budgeting, accounting, personal finance",
	alternates: {
		canonical: url,
	},
	publisher: "Samyabrata Maji",
	openGraph: {
		title,
		description,
		url,
		siteName: "Paytrack",
		images: [
			{
				url: "https://paytrack-site-prod.vercel.app/images/budgetbee-og.png",
				width: 1200,
				height: 630,
				alt: "Paytrack",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: [
			{
				url: "https://paytrack-site-prod.vercel.app/images/budgetbee-og.png",
				width: 1200,
				height: 630,
				alt: "Paytrack",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="icon"
					type="image/png"
					href="/favicon-96x96.png"
					sizes="96x96"
				/>
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="shortcut icon" href="/favicon.ico" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<meta name="apple-mobile-web-app-title" content="Paytrack" />
				<link rel="manifest" href="/manifest.webmanifest" />
			</head>
			<body
				className={cn(
					`${inter.className}`,
					instrumentSerif.variable,
					"dark",
				)}>
				{process.env.NODE_ENV === "production" &&
					process.env.GOOGLE_ANALYTICS_ID && (
						<GoogleAnalytics
							gaId={process.env.GOOGLE_ANALYTICS_ID}
						/>
					)}
				<NuqsAdapter>
					<div>
						<div className="mx-auto flex max-w-5xl justify-center">
							<Navbar />
						</div>
						{children}
						<Footer />
					</div>
				</NuqsAdapter>
				<Toaster />
			</body>
		</html>
	);
}
