import BudgetbeeLogo from "@/public/images/logo/wallet_16.svg";
import {
	IconBrandGithubFilled,
	IconBrandSlack,
	IconBrandX,
	IconBrandYoutubeFilled,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

type FooterBlock = { title: string; link: { name: string; href: string }[] };

const blocks: FooterBlock[] = [
	{
		title: "Company",
		link: [
			{ name: "About Us", href: "/about-us" },
			{ name: "Blog", href: "/blog" },
			{ name: "Careers", href: "/careers" },
			{ name: "Customers", href: "/customers" },
		],
	},
	{
		title: "Resources",
		link: [
			{ name: "Startup Program", href: "/startup-program" },
			{ name: "Community", href: "/community" },
			{ name: "Contact", href: "/contact" },
			{ name: "DPA", href: "/dpa" },
		],
	},
	{
		title: "Legal",
		link: [
			{ name: "Privacy Policy", href: "/privacy-policy" },
			{ name: "Terms of Service", href: "/terms-of-service" },
			{ name: "Report a Vulnerability", href: "/report-vulnerability" },
		],
	},
	{
		title: "Developers",
		link: [
			{ name: "API", href: "/api" },
			{ name: "Status", href: "/status" },
			{ name: "GitHub", href: "/github" },
			{ name: "README", href: "/readme" },
		],
	},
] as const;

export function Footer() {
	return (
		<div className="grid gap-8 text-sm lg:grid-cols-6">
			<div className="col-span-2 flex justify-between lg:flex-col">
				<div className="inline-flex items-center gap-1">
					<img
						alt="Budgetbee logo"
						src={BudgetbeeLogo.src}
						className="h-6 w-6"
					/>
					<p className="text-[#A3A3A3]">Budgetbee</p>
				</div>
				<div className="inline-flex gap-4 text-[#A3A3A3] [&>*]:h-4 [&>*]:w-4">
					<IconBrandGithubFilled />
					<IconBrandYoutubeFilled />
					<IconBrandX />
					<IconBrandSlack />
				</div>
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
