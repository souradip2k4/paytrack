"use client";

import { PricingSection } from "@/components/pricing";
import { BentoGrid } from "@/components/section/bento-grid";
import { Button } from "@/components/ui/button";
import BudgetbeeDashboardImg from "@/public/images/budgetbee_dashboard.png";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const heroFeatures = [
	"Intuitive",
	"End-to-end encryption",
	"Audit logs",
	"Third party integrations",
];

export default function GradientHero() {
	return (
		<main>
			<div className="flex flex-col justify-center gap-4 px-8 py-24 lg:items-center">
				<h1 className="text-accent-foreground hidden items-center text-2xl lg:flex lg:text-5xl">
					Seemlessly track your
					<span className="text-slider text-primary">
						<span className="text-slider__word">finances</span>
						<span className="text-slider__word">expense</span>
						<span className="text-slider__word">subscriptions</span>
					</span>
				</h1>
				<h1 className="text-2xl lg:hidden">
					Seemlessly track your finances
				</h1>
				<h2 className="text-muted-foreground text-xl leading-relaxed lg:w-1/2 lg:text-center">
					Do you find managing your finances{" "}
					<span className="text-accent-foreground">tedious</span> and{" "}
					<span className="text-accent-foreground">difficult</span>?
					With budgetbee you can track your spendings and gain
					valuable{" "}
					<span className="text-accent-foreground">insights</span>.
				</h2>
				<div className="mt-4 lg:flex">
					<Button asChild>
						<Link href="/join">
							Get started
							<ArrowRight />
						</Link>
					</Button>
					{/*<Button variant="secondary" className="ml-2" asChild>
                            <Link href="/blogs/getting-started">
                                Learn more
                            </Link>
                        </Button>*/}
				</div>

				<div className="bg-primary/10 mt-8 w-full rounded-xl p-2 lg:w-2/3">
					<img
						src={BudgetbeeDashboardImg.src}
						className="animate-border h-auto w-full rounded-xl border border-2 border-transparent [background:linear-gradient(45deg,#0d542b,theme(colors.slate.800)_50%,#0d542b)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_#00bc7d_86%,_#8ff0a4_90%,_#00bc7d_94%,_theme(colors.slate.600/.48))_border-box]"
					/>
				</div>
			</div>

			{/** BENTO GRID SECTION **/}
			<BentoGrid />

			<PricingSection />
		</main>
	);
}

{
	/*
'use client';
 
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

<div className="min-h-screen w-full relative bg-black">
    <div
      className="absolute inset-0 z-0"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), #000000",
      }}
    />
  
  </div>
 
export default function NotebookHero() {
  return (
    <div className="min-h-screen py-6 sm:py-14">
 
      <div className="pointer-events-none absolute inset-0 top-0 z-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-rose-500/30 via-rose-500/20 to-transparent opacity-50 blur-[100px]" />
        <div className="absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-red-500/30 via-red-500/20 to-transparent opacity-50 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-amber-500/20 via-amber-500/10 to-transparent opacity-30 blur-[80px]" />
      </div>
 
      <main className="container relative mt-4 max-w-[1100px] px-2 py-4 lg:py-8">
        <div className="relative sm:overflow-hidden">
          <div className="relative flex flex-col items-start justify-start rounded-xl border border-primary/20 bg-fd-background/70 px-4 pt-12 shadow-xl shadow-primary/10 backdrop-blur-md max-md:text-center md:px-12 md:pt-16">
            <div
              className="animate-gradient-x absolute inset-0 top-32 z-0 hidden blur-2xl dark:block"
              style={{
                maskImage:
                  'linear-gradient(to bottom, transparent, white, transparent)',
                background:
                  'repeating-linear-gradient(65deg, hsl(var(--primary)), hsl(var(--primary)/0.8) 12px, color-mix(in oklab, hsl(var(--primary)) 30%, transparent) 20px, transparent 200px)',
                backgroundSize: '200% 100%',
              }}
            />
            <div
              className="animate-gradient-x absolute inset-0 top-32 z-0 text-left blur-2xl dark:hidden"
              style={{
                maskImage:
                  'linear-gradient(to bottom, transparent, white, transparent)',
                background:
                  'repeating-linear-gradient(65deg, hsl(var(--primary)/0.9), hsl(var(--primary)/0.7) 12px, color-mix(in oklab, hsl(var(--primary)) 30%, transparent) 20px, transparent 200px)',
                backgroundSize: '200% 100%',
              }}
            />
            <h1 className="mb-4 flex flex-wrap gap-2 text-3xl font-medium leading-tight md:text-5xl">
              Build <span className="text-primary">Beautiful UI</span> with
              MVPBlocks
            </h1>
            <p className="mb-8 text-left text-muted-foreground md:max-w-[80%] md:text-xl">
              Your comprehensive library of ready-to-use UI components built
              with Next.js and Tailwind CSS. From simple buttons to complex
              layouts, MVPBlocks helps you create stunning interfaces with
              minimal effort.
            </p>
 
            <div className="z-10 mt-2 inline-flex items-center justify-start gap-3">
              <a
                href="#"
                className={cn(
                  buttonVariants({
                    size: 'lg',
                    className:
                      'rounded-full bg-gradient-to-b from-primary to-primary/80 text-primary-foreground',
                  }),
                )}
              >
                Getting Started <ArrowRight className="size-4" />
              </a>
              <a
                href="https://github.com/subhadeeproy3902/mvpblocks"
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  buttonVariants({
                    size: 'lg',
                    variant: 'outline',
                    className: 'rounded-full bg-fd-background',
                  }),
                )}
              >
                GitHub{' '}
                <svg
                  className="ml-1 inline size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
 
            <div className="relative z-10 mt-16 w-full">
              <img
                src="https://blocks.mvp-subha.me/assets/bg.png"
                alt="MVPBlocks component library preview"
                width={1000}
                height={600}
                className="border-6 z-10 mx-auto -mb-60 w-full select-none rounded-lg border-neutral-100 object-cover shadow-2xl duration-1000 animate-in fade-in slide-in-from-bottom-12 dark:border-neutral-600 lg:-mb-40"
              />
 
              <div className="absolute -right-6 -top-6 rotate-6 transform rounded-lg bg-white p-3 shadow-lg animate-in fade-in slide-in-from-left-4 dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="font-medium">Ready-to-Use Components</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
 */
}
