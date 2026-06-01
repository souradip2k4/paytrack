import { Toaster } from "@budgetbee/ui/core/sonner";
import { cn } from "@budgetbee/ui/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
	title: "Paytrack",
	description: "Simple, user-freidly, minimal expense tracker.",
	keywords:
		"budgetbee, budget, expense, tracker, budgeting, accounting, personal finance",
	openGraph: {
		title: "Paytrack",
		description: "Simple, user-freidly, minimal expense tracker.",
		url: "https://paytrack-web.vercel.app",
		siteName: "Paytrack",
		images: [
			{
				url: "https://paytrack-web.vercel.app/images/budgetbee-og.png",
				width: 1200,
				height: 630,
				alt: "Paytrack",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Paytrack",
		description: "Simple, user-freidly, minimal expense tracker.",
		images: [
			{
				url: "https://paytrack-web.vercel.app/images/budgetbee-og.png",
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
			<body className={cn(`${inter.className}`)}>
				<GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID!} />
				<Providers>
					{children}
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
