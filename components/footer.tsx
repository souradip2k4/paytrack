import BudgetbeeLogo from "@/public/images/logo/wallet_16.svg";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type FooterBlock = { title: string; link: { name: string; href: string }[] };

const blocks: FooterBlock[] = [
    {
        title: "Company",
        link: [
            { name: "Community", href: "https://discord.gg/auFkSuADMe" },
            { name: "Contact us", href: "/contact" },
            { name: "Report a bug", href: "/report-a-bug" },
        ],
    },
    {
        title: "Legal",
        link: [
            { name: "Privacy Policy", href: "/legal/privacy-policy" },
            {
                name: "Terms and conditions",
                href: "/legal/terms-and-conditions",
            },
        ],
    },
    {
        title: "Developers",
        link: [
            // { name: "API", href: "/api" },
            { name: "Status", href: "https://budgetbee.openstatus.dev" },
            // { name: "GitHub", href: "https://github.com/budgetbee-org" },
            // { name: "README", href: "/readme" },
        ],
    },
] as const;

export function Footer() {
    return (
        <div className="grid gap-8 px-36 text-sm lg:grid-cols-6">
            <div className="col-span-3 flex justify-between lg:flex-col">
                <div className="inline-flex items-center gap-1">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            alt="Budgetbee Logo"
                            height={24}
                            width={24}
                            src="/images/budgetbee.svg"
                            className="flex items-center justify-center rounded-lg"
                        />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <p className="truncate text-2xl">Budgetbee</p>
                        </div>
                    </Link>
                </div>
                {/*
				<div className="inline-flex gap-4 text-[#A3A3A3] [&>*]:h-4 [&>*]:w-4">
					<IconBrandGithubFilled />
					<IconBrandYoutubeFilled />
					<IconBrandX />
					<IconBrandSlack />
				</div>
                */}
            </div>
            {blocks.map((item: any, index: number) => {
                return (
                    <React.Fragment key={`fbl-${index}`}>
                        <div className="flex flex-col gap-4">
                            <h3 className="">{item.title}</h3>
                            {item.link.map((link: any, index: number) => (
                                <footer key={`flnk-${index}`}>
                                    <Link
                                        className="text-[#A3A3A3]"
                                        key={`fl-${index}`}
                                        href={link.href}>
                                        {link.name}
                                    </Link>
                                </footer>
                            ))}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
