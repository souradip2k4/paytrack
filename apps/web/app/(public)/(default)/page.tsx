"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
			<div className="bg-background relative w-full overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 z-0">
					<div className="from-primary/20 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
					<div className="bg-primary/5 absolute left-1/2 top-0 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"></div>
				</div>
				<div className="bg-[liA modern UI component library designed to help developers create stunning web applications with minimal effort. Fully customizable, responsive, and accessible.near-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] absolute inset-0 bg-[size:16px_16px] opacity-15"></div>

				<div className="container relative z-10 mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
					<div className="mx-auto max-w-5xl">
						{/* Badge */}
						{/*<motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mx-auto mb-6 flex justify-center">
                            <div className="border-border bg-background/80 inline-flex items-center rounded-full border px-3 py-1 text-sm backdrop-blur-sm">
                                <span className="bg-primary mr-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                                    New
                                </span>
                                <span className="text-muted-foreground">
                                    Introducing our latest component library
                                </span>
                                <ChevronRight className="text-muted-foreground ml-1 h-4 w-4" />
                            </div>
                        </motion.div>*/}

						{/* Heading */}
						<motion.h1
							initial={{
								opacity: 0,
								y: 20,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.5,
								delay: 0.1,
							}}
							className="from-primary/10 via-foreground/85 to-foreground/50 text-balance bg-gradient-to-tl bg-clip-text text-center text-4xl tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
							Accounting Software for Non-accountants.
						</motion.h1>

						{/* Description */}
						<motion.p
							initial={{
								opacity: 0,
								y: 20,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.5,
								delay: 0.2,
							}}
							className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg">
							Budgetbee is a simple accounting tool to help you
							manage your income, expenses, subscriptions,
							inventory and more.
						</motion.p>

						<div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:flex-row">
							{heroFeatures.map((hf, i) => (
								<div
									className="flex items-center gap-2"
									key={i}>
									<svg
										className="text-primary h-5 w-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M5 13l4 4L19 7"></path>
									</svg>
									<span>{hf}</span>
								</div>
							))}
						</div>

						{/* CTA Buttons */}
						<motion.div
							initial={{
								opacity: 0,
								y: 20,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.5,
								delay: 0.3,
							}}
							className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								size="lg"
								className="bg-primary text-primary-foreground hover:shadow-primary/30 group relative overflow-hidden rounded-full px-6 shadow-lg transition-all duration-300"
								asChild>
								<Link href="/login">
									<span className="relative z-10 flex items-center">
										Get Started
										<ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
									</span>
									<span className="from-primary via-primary/90 to-primary/80 absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
								</Link>
							</Button>

							{/*<Button
                                variant="outline"
                                size="lg"
                                className="border-border bg-background/50 flex items-center gap-2 rounded-full backdrop-blur-sm">
                                <Github className="h-4 w-4" />
                                Star on GitHub
                            </Button>*/}
						</motion.div>

						{/* Feature Image */}
						<motion.div
							initial={{
								opacity: 0,
								y: 40,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.8,
								delay: 0.5,
								type: "spring",
								stiffness: 50,
							}}
							className="relative mx-auto mt-16 max-w-4xl">
							<div className="border-border/40 bg-background/50 overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm">
								<div className="border-border/40 bg-muted/50 flex h-10 items-center border-b px-4">
									<div className="flex space-x-2">
										<div className="h-3 w-3 rounded-full bg-red-500"></div>
										<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
										<div className="h-3 w-3 rounded-full bg-green-500"></div>
									</div>
									<div className="bg-background/50 text-muted-foreground mx-auto flex items-center rounded-md px-3 py-1 text-xs">
										https://budgetbee.site
									</div>
								</div>
								<div className="relative">
									<img
										src="/images/budgetbee_dashboard.webp"
										alt="Dashboard Preview"
										className="w-full"
									/>
									<div className="from-background absolute inset-0 bg-gradient-to-t to-transparent opacity-0"></div>
								</div>
							</div>

							{/* Floating elements for visual interest */}
							<div className="border-border/40 bg-background/80 absolute -right-6 -top-6 h-12 w-12 rounded-lg border p-3 shadow-lg backdrop-blur-md">
								<div className="bg-primary/20 h-full w-full rounded-md"></div>
							</div>
							<div className="border-border/40 bg-background/80 absolute -bottom-4 -left-4 h-8 w-8 rounded-full border shadow-lg backdrop-blur-md"></div>
							<div className="border-border/40 bg-background/80 absolute -bottom-6 right-12 h-10 w-10 rounded-lg border p-2 shadow-lg backdrop-blur-md">
								<div className="h-full w-full rounded-md bg-green-500/20"></div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>

			{/* CTA */}
			{/*
            <div className="mx-auto my-16 relative w-full max-w-4xl overflow-hidden rounded-[40px] bg-primary p-6 sm:p-10 md:p-20">
                <div className="absolute inset-0 hidden h-full w-full overflow-hidden md:block">
                    <div className="absolute right-[-45%] top-1/2 aspect-square h-[800px] w-[800px] -translate-y-1/2">
                        <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.8] rounded-full bg-emerald-300 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.6] rounded-full bg-emerald-200 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.4] rounded-full bg-emerald-100 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.2] rounded-full bg-emerald-50 opacity-30"></div>
                        <div className="absolute inset-0 scale-[0.1] rounded-full bg-white/50 opacity-30"></div>
                    </div>
                </div>

                <div className="relative z-10">
                    <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:mb-4 md:text-5xl">
                        Let&apos;s Get In Touch.
                    </h1>
                    <p className="mb-6 max-w-md text-base text-white sm:text-lg md:mb-8">
                        Your laboratory instruments should serve you, not the other way
                        around. We&apos;re happy to help you.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                        <button className="flex w-full items-center justify-between rounded-full bg-black px-5 py-3 text-white sm:w-[240px]">
                            <span className="font-medium">Book a discovery call</span>
                            <span className="h-5 w-5 flex-shrink-0 rounded-full bg-white"></span>
                        </button>
                        <button className="flex w-full items-center justify-between rounded-full bg-black px-5 py-3 text-white sm:w-[240px]">
                            <span className="font-medium">Test Your Samples</span>
                            <span className="h-5 w-5 flex-shrink-0 rounded-full bg-white"></span>
                        </button>
                    </div>
                </div>
            </div>
            */}
		</main>
	);
}

{
	/*
'use client';
 
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
 
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
