import { formatLowestUnitCurrency } from "@/lib/money-utils";
import { polarClient } from "@/lib/polar";
import { auth } from "@budgetbee/core/auth";
import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { Separator } from "@budgetbee/ui/core/separator";
import { type Checkout } from "@polar-sh/sdk/models/components/checkout.js";
import { ArrowUpRight, Check } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function WelcomePage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string>>;
}) {
	const id = (await searchParams).id;
	let checkout: Checkout = await polarClient.checkouts
		.get({ id })
		.catch(notFound);

	const net = formatLowestUnitCurrency(checkout.netAmount, checkout.currency);
	const discount = formatLowestUnitCurrency(
		-1 * checkout.discountAmount,
		checkout.currency,
	);
	const tax = formatLowestUnitCurrency(checkout.taxAmount, checkout.currency);
	const total = formatLowestUnitCurrency(
		checkout.totalAmount,
		checkout.currency,
	);

	const portal = await auth.api
		.portal({ headers: await headers() })
		.catch(e => {
			console.log("ERROR: failed to load portal", e.message);
			return null;
		});

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-16 p-4">
			<div className="flex flex-col items-center justify-center gap-2">
				<Check className="size-24 rounded-full bg-emerald-500 stroke-2 p-4" />
				<h1 className="text-center text-2xl">Payment successful</h1>
				<p className="text-muted-foreground text-center">
					Thank you for your purchase!
				</p>
				<Button className="mt-4" asChild>
					<Link href="/transactions?show_tutorial=true">
						Go to dashboard <ArrowUpRight />
					</Link>
				</Button>
			</div>

			<Card className="w-full max-w-xl">
				<CardHeader className="border-b">
					<CardTitle className="font-normal">
						Order summary.
					</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<p>Plan</p>
						<p className="whitespace-pre-wrap">
							{checkout.product.name}
						</p>

						<Separator className="col-span-2" />

						<p>Description</p>
						<p className="whitespace-pre-wrap">
							{checkout.product.description}
						</p>

						<Separator className="col-span-2" />

						<p>Net amount</p>
						<p>{net}</p>

						<p>Discounted amount</p>
						<p>{discount}</p>

						<p>Tax amount</p>
						<p>{tax}</p>

						<p>Total amount</p>
						<p>{total}</p>
					</div>
				</CardContent>

				<CardFooter className="border-t">
					<Button
						disabled={!portal?.url}
						variant="ghost"
						size="sm"
						className="ml-auto"
						asChild>
						<Link href={portal?.url || "#"}>
							Visit payment portal <ArrowUpRight />
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
