import { PricingCardGroup } from "@/components/pricing";
import { Button } from "@/components/ui/button";
import DataSetsImg from "@/public/images/datasets.webp";
import LinearImg from "@/public/images/linear.webp";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
	return (
		<main>
			<div className="flex flex-col justify-center gap-4 px-8 py-16 lg:items-center">
				<h1 className="hidden items-center text-2xl text-[#A3A3A3] lg:flex lg:text-5xl">
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
				<p className="text-lg text-[#A3A3A3] lg:w-1/2 lg:text-center">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
					do eiusmod tempor incididunt ut labore et dolore magna
					aliqua.
				</p>
				<div className="mt-4 lg:flex">
					<SignedIn>
						<Button
							className="group mb-4 w-full bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
							asChild>
							<Link href="/dashboard">
								Open dashboard
								<span className="ml-1 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5">
									🡒
								</span>
							</Link>
						</Button>
					</SignedIn>
					<SignedOut>
						<Button
							className="group mb-4 w-full bg-gradient-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] text-white shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:bg-[length:100%_150%] sm:mb-0 sm:w-auto"
							asChild>
							<Link href="/join">
								Get started
								<span className="ml-1 tracking-normal text-white/50 transition-transform group-hover:translate-x-0.5">
									🡒
								</span>
							</Link>
						</Button>
						<Button
							className="relative w-full bg-gradient-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] text-gray-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,theme(colors.gray.800),theme(colors.gray.700),theme(colors.gray.800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-[length:100%_150%] sm:ml-4 sm:w-auto"
							asChild>
							<Link href="/blogs/getting-started">
								Learn more
							</Link>
						</Button>
					</SignedOut>
				</div>

				<div className="mt-4 w-full rounded-md bg-black/20 p-4 lg:w-2/3">
					<img
						src={LinearImg.src}
						className="h-auto w-full rounded-md"
					/>
				</div>
			</div>

			{/** BENTO GRID SECTION **/}
			<div className="h-screen w-full border-b border-t px-4 py-8 lg:px-36 lg:py-16">
				<div className="grid h-full w-full grid-cols-1 grid-rows-3 gap-4 lg:grid-cols-2 lg:grid-rows-2">
					<div className="flex h-full w-full flex-col gap-8 rounded-lg border p-8 lg:row-span-2">
						<img className="h-full w-fit" src={DataSetsImg.src} />
						<div>
							<h1 className="text-lg">Gain valuable insights</h1>
							<p className="text-sm text-[#a3a3a3]">
								Lorem ipsum dolor sit amet, consectetur
								adipiscing elit. Ut dui urna, pharetra eu
								pretium sit amet, placerat vel eros.
							</p>
						</div>
					</div>
					<div className="rounded-lg border p-8">
						<h1 className="text-lg">Track finances</h1>
						<p className="text-sm text-[#a3a3a3]">
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit. Ut dui urna, pharetra eu pretium sit amet,
							placerat vel eros.
						</p>
					</div>
					<div className="rounded-lg border p-8">
						<h1 className="text-lg">Automate things</h1>
						<p className="text-sm text-[#a3a3a3]">
							Lorem ipsum dolor sit amet, consectetur adipiscing
							elit. Ut dui urna, pharetra eu pretium sit amet,
							placerat vel eros.
						</p>
					</div>
				</div>
			</div>

			<div className="flex flex-col items-center justify-center space-y-4 px-4 py-8 lg:space-y-8 lg:px-8 lg:py-16">
				<h1 className="text-2xl text-[#A3A3A3] lg:text-5xl">
					One <span className="text-white">flexible pricing</span> for
					all.
				</h1>
				<PricingCardGroup />
			</div>
		</main>
	);
}
