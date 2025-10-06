import Link from "next/link";
import { BudgetbeeLogo } from "./budgetbee-logo";

const footerConfig = {
    columns: [
        {
            title: "Company",
            links: [
                { label: "Blog", href: "/blog" },
                { label: "Support", href: "/support" },
                { label: "Report a bug", href: "/report-a-bug" },
            ],
        },
        {
            title: "Platform",
            links: [
                { label: "Overview", href: "/overview" },
                { label: "Pricing", href: "/pricing" },
                { label: "Changelog", href: "/changelog" },
                { label: "Status", href: "https://budgetbee.openstatus.dev" },
            ],
        },
        {
            title: "Legal",
            links: [
                { label: "Privacy Policy", href: "/legal/privacy-policy" },
                { label: "Terms of Service", href: "/legal/terms-and-conditions" },
                { label: "Refund Policy", href: "/legal/refund-policy" },
                { label: "Cookie Policy", href: "/legal/cookie-policy" },
            ],
        },
    ],
};

export function Footer() {
    return (
        <footer className="bg-black/50 py-24 md:px-8 px-4 border-t">
            <div className="max-w-7xl mx-auto">

                <div className="mb-12 space-y-4">
                    <div className="relative mb-6">
                        <BudgetbeeLogo width={32} height={32} />
                    </div>

                    <div className="space-y-2 grow">
                        <h1>Budgetbee</h1>
                        <p className="leading-relaxed text-muted-foreground">Simple, intuitive, powerful expense tracker :)</p>
                    </div>
                </div>


                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {footerConfig.columns.map((col, idx) => (
                        <div key={idx}>
                            <h3 className="text-sm font-medium mb-3">{col.title}</h3>
                            <ul className="space-y-2">
                                {col.links.map((link, i) => (
                                    <li key={i}>
                                        <Link
                                            href={link.href}
                                            className="text-muted-foreground hover:text-primary-foreground underline decoration-dotted transition"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="col-span-3 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
                    <p>© 2025 Budgetbee. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="https://budgetbee.openstatus.dev">Status</Link>
                        <Link href="/sitemap.xml">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

