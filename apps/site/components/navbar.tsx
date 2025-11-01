"use client";

import { SignedIn } from "@budgetbee/core/ui/signed-in";
import { SignedOut } from "@budgetbee/core/ui/signed-out";
import { Button } from "@budgetbee/ui/core/button";
import { cn } from "@budgetbee/ui/lib/utils";
import { Equal, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { BudgetbeeLogo } from "./budgetbee-logo";

const menuItems = [
	{ name: "Overview", href: "/overview" },
	{ name: "Pricing", href: "/pricing" },
	{
		name: "Support",
		href: "https://nocodb.sammaji.com/dashboard/#/nc/form/780055c9-89b3-4c1f-825b-2fca58cd2336",
	},
];

export function Navbar() {
	const [menuState, setMenuState] = React.useState(false);
	const [isScrolled, setIsScrolled] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);
	return (
		<header>
			<nav
				data-state={menuState && "active"}
				className="fixed left-0 z-20 w-full px-2">
				<div
					className={cn(
						"mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
						isScrolled &&
							"bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5",
					)}>
					<div className="relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0">
						<div className="flex w-full justify-between lg:w-auto">
							<Link
								href="/"
								aria-label="home"
								className="flex items-center gap-2">
								<BudgetbeeLogo />
								<p className="text-xl font-semibold tracking-tighter">
									{" "}
									Budgetbee
								</p>
							</Link>

							<button
								onClick={() => setMenuState(!menuState)}
								aria-label={
									menuState == true ? "Close Menu" : (
										"Open Menu"
									)
								}
								className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
								<Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
								<X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
							</button>
						</div>

						<div className="absolute inset-0 m-auto hidden size-fit lg:block">
							<ul className="flex gap-8 text-sm">
								{menuItems.map((item, index) => (
									<li key={index}>
										<Link
											href={item.href}
											className="text-muted-foreground hover:text-accent-foreground block duration-150">
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
							<div className="lg:hidden">
								<ul className="space-y-6 text-base">
									{menuItems.map((item, index) => (
										<li key={index}>
											<Link
												href={item.href}
												className="text-muted-foreground hover:text-accent-foreground block duration-150">
												<span>{item.name}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
								<SignedOut>
									<Button
										asChild
										variant="outline"
										size="sm"
										className={cn(
											"rounded-full",
											isScrolled && "lg:hidden",
										)}>
										<Link
											href={
												process.env
													.NEXT_PUBLIC_APP_URL +
												"/login"
											}>
											<span>Login</span>
										</Link>
									</Button>
									<Button
										asChild
										size="sm"
										variant="secondary"
										className={cn(
											"rounded-full",
											isScrolled && "lg:hidden",
										)}>
										<Link
											href={
												process.env
													.NEXT_PUBLIC_APP_URL +
												"/home"
											}>
											<span>Sign up</span>
										</Link>
									</Button>
									<Button
										asChild
										size="sm"
										variant="secondary"
										className={cn(
											"rounded-full",
											isScrolled ? "lg:inline-flex" : (
												"hidden"
											),
										)}>
										<Link
											href={
												process.env
													.NEXT_PUBLIC_APP_URL +
												"/home"
											}>
											<span>Get Started</span>
										</Link>
									</Button>
								</SignedOut>
								<SignedIn>
									<Button
										asChild
										size="sm"
										variant="secondary"
										className="rounded-full">
										<Link
											href={
												process.env
													.NEXT_PUBLIC_APP_URL +
												"/home"
											}>
											<span>Dashboard</span>
										</Link>
									</Button>
								</SignedIn>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
}
