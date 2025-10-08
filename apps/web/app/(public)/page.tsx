"use client";

import { PricingSection } from "@/components/pricing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    ArrowRight,
    BellRing,
    FileSpreadsheet,
    ShieldCheck,
    Zap,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
    return (
        <main>
            <div
                className={cn(
                    "flex flex-col justify-center gap-8 overflow-x-hidden px-8 py-24 md:py-48 lg:items-center",
                    "bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(34,197,94,0.25),transparent_70%)]",
                    "lg:bg-[radial-gradient(ellipse_40%_30%_at_50%_0%,rgba(34,197,94,0.25),transparent_70%)]",
                )}>
                <h1
                    className={cn(
                        "text-accent-foreground hidden select-none items-center text-2xl font-[Instrument_Serif] lg:flex lg:text-5xl",
                    )}>
                    Seemlessly track your
                    <span className="text-slider text-primary">
                        <span className="text-slider__word">finances</span>
                        <span className="text-slider__word">expense</span>
                        <span className="text-slider__word">subscriptions</span>
                    </span>
                </h1>
                <h1 className="text-4xl font-[Instrument_Serif] lg:hidden">
                    Seemlessly track your{" "}
                    <span className="text-primary">finances</span>
                </h1>
                <h2 className="text-muted-foreground text-lg leading-relaxed md:text-xl lg:w-1/2 lg:text-center">
                    Do you find managing your finances{" "}
                    <span className="text-accent-foreground">tedious</span> and{" "}
                    <span className="text-accent-foreground">difficult</span>?
                    With budgetbee you can track your spendings and gain
                    valuable{" "}
                    <span className="text-accent-foreground">insights</span>.
                </h2>
                <div className="space-x-2 space-y-2 lg:flex">
                    <Button asChild className="rounded-full" size="lg">
                        <Link href="/home">
                            Start tracking
                            <ArrowRight />
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="rounded-full"
                        size="lg">
                        <Link href="/overview">
                            Learn more
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>

                <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                    <div
                        aria-hidden
                        className="to-background absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35%"
                    />
                    <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-accent/20 relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-2 shadow-lg shadow-zinc-950/15 ring-1">
                        <img
                            className="bg-background aspect-15/8 relative rounded-2xl"
                            src={"/images/budgetbee-dashboard-1.png"}
                            alt="Budgetbee dashboard"
                            width="2700"
                            height="1440"
                        />
                    </div>
                </div>
            </div>

            <section className="py-8 md:py-16">
                <div className="mx-auto max-w-xl px-6 md:max-w-7xl">
                    <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
                        <div className="lg:col-span-2">
                            <div className="md:pr-6 lg:pr-0">
                                <h2 className="text-accent-foreground select-none items-center text-2xl font-[Instrument_Serif] leading-normal lg:flex lg:text-5xl">
                                    Simple, intuitive, powerful.
                                </h2>
                            </div>
                            <ul className="[&_p]:hover:text-primary-foreground mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3 [&_p]:transition">
                                <li>
                                    <ShieldCheck
                                        className="size-5 fill-amber-500/20 stroke-amber-500"
                                        strokeWidth={1}
                                    />
                                    <p className="text-muted-foreground">
                                        <span className="text-primary-foreground underline decoration-dotted">
                                            Secure
                                        </span>{" "}
                                        by default.
                                    </p>
                                </li>
                                <li>
                                    <Zap className="size-5 fill-green-500/20 stroke-green-500" />
                                    <p className="text-muted-foreground">
                                        Powerful analytics.
                                    </p>
                                </li>
                                <li>
                                    <FileSpreadsheet className="size-5 fill-blue-500/20 stroke-blue-500" />
                                    <p className="text-muted-foreground">
                                        Connect with Google Sheets.
                                    </p>
                                </li>
                                <li>
                                    <BellRing className="size-5 fill-red-500/20 stroke-red-500" />
                                    <p className="text-muted-foreground">
                                        Email alerts.
                                    </p>
                                </li>
                            </ul>
                        </div>
                        <div className="border-border/50 bg-accent/20 relative rounded-3xl border p-3 lg:col-span-3">
                            <div className="aspect-76/59 relative rounded-2xl bg-gradient-to-b from-zinc-300 to-transparent p-px dark:from-zinc-700">
                                <img
                                    src="/images/budgetbee-tables-preview.png"
                                    className="h-full w-full rounded-[15px]"
                                    alt="budgetbee transactions view"
                                    width={1207}
                                    height={929}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PricingSection />
        </main>
    );
}
