"use client";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const links: { name: string; href: string | URL }[] = [
    { name: "Overview", href: "/overview" },
    { name: "Pricing", href: "/pricing" },
    // { name: "About", href: "/about" },
    { name: "Support", href: "/contact" },
];

export function Navbar() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    return (
        <div className="flex h-[56px] items-center justify-between border-b px-2 md:px-8">
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

            {isDesktop && (
                <React.Fragment>
                    <div className="[&>a:hover]:text-primary hidden gap-4 text-sm lg:flex">
                        {links.map((link, index) => (
                            <React.Fragment key={index}>
                                <Link href={link.href}>{link.name}</Link>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="hidden space-x-2 lg:block">
                        <SignedOut>
                            <Button asChild size="sm" variant="secondary">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/join">Signup</Link>
                            </Button>
                        </SignedOut>
                        <SignedIn>
                            <Button asChild size="sm" variant="secondary">
                                <Link href="/insights">Dashboard</Link>
                            </Button>
                        </SignedIn>
                    </div>
                </React.Fragment>
            )}

            {!isDesktop && (
                <DropdownMenu modal>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline">
                            <Menu className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuPortal>
                        <DropdownMenuContent>
                            {links.map((link, index) => (
                                <DropdownMenuItem key={index}>
                                    <Link href={link.href}>{link.name}</Link>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Login</DropdownMenuItem>
                            <DropdownMenuItem>Signin</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
            )}
        </div>
    );
}
