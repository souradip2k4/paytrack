import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
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
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/favicon.ico" />
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
