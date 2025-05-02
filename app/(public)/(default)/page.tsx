import { PricingCardGroup, PricingSection } from "@/components/pricing";
import { BentoGrid } from "@/components/section/bento-grid";
import { Button } from "@/components/ui/button";
import BudgetbeeDashboardImg from "@/public/images/budgetbee_dashboard.png";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Page() {
    return (
        <main>
            <div className="flex flex-col justify-center gap-4 px-8 py-16 lg:items-center">
                <h1 className="text-muted-foreground hidden items-center text-2xl lg:flex lg:text-5xl">
                    Seemlessly track your
                    <span className="text-slider text-white">
                        <span className="text-slider__word">finances</span>
                        <span className="text-slider__word">expense</span>
                        <span className="text-slider__word">subscriptions</span>
                    </span>
                </h1>
                <h1 className="text-2xl lg:hidden">
                    Seemlessly track your finances
                </h1>
                <p className="text-muted-foreground text-lg lg:w-1/2 lg:text-center">
                    Do you find managing your finances{" "}
                    <span className="text-white">tedious</span> and
                    <span className="text-white"> difficult</span>? With
                    budgetbee you can track your spendings and gain valuable{" "}
                    <span className="text-white">insights</span>.
                </p>
                <div className="mt-4 lg:flex">
                    <SignedIn>
                        <Button asChild>
                            <Link href="/insights">
                                Open dashboard
                                <span className=""><ArrowRight className="size-4" /></span>
                            </Link>
                        </Button>
                    </SignedIn>
                    <SignedOut>
                        <Button asChild>
                            <Link href="/join">
                                Get started
                                <span>🡒</span>
                            </Link>
                        </Button>
                        <Button variant="secondary" className="ml-2" asChild>
                            <Link href="/blogs/getting-started">
                                Learn more
                            </Link>
                        </Button>
                    </SignedOut>
                </div>

                <div className="mt-4 w-full rounded-md bg-black/20 p-4 lg:w-2/3">
                    <img
                        src={BudgetbeeDashboardImg.src}
                        className="h-auto w-full rounded-md"
                    />
                </div>
            </div>

            {/** BENTO GRID SECTION **/}
            <BentoGrid />

            <PricingSection />
        </main>
    );
}
