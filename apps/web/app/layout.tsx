import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

const helvetica = localFont({
	src: [
		{
			path: "../public/fonts/helvetica-light.ttf",
			weight: "200",
			style: "normal",
		},
		{
			path: "../public/fonts/helvetica.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../public/fonts/helvetica-oblique.ttf",
			weight: "400",
			style: "italic",
		},
		{
			path: "../public/fonts/helvetica-bold.ttf",
			weight: "600",
			style: "normal",
		},
		{
			path: "../public/fonts/helvetica-bold-oblique.ttf",
			weight: "600",
			style: "italic",
		},
	],
});

export const metadata: Metadata = {
	title: "Budgetbee",
	description: "Simple, user-freidly, minimal expense tracker.",
	keywords:
		"budgetbee, budget, expense, tracker, budgeting, accounting, personal finance",
	openGraph: {
		title: "Budgetbee",
		description: "Simple, user-freidly, minimal expense tracker.",
		url: "https://www.budgetbee.site",
		siteName: "Budgetbee",
		images: [
			{
				url: "https://www.budgetbee.site/images/budgetbee-og.png",
				width: 1200,
				height: 630,
				alt: "Budgetbee",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Budgetbee",
		description: "Simple, user-freidly, minimal expense tracker.",
		images: [
			{
				url: "https://www.budgetbee.site/images/budgetbee-og.png",
				width: 1200,
				height: 630,
				alt: "Budgetbee",
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
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/favicon.ico" />
			</head>
			<body className={cn(`${helvetica.className}`)}>
				<GoogleAnalytics gaId={process.env.GA_ID as string} />
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
