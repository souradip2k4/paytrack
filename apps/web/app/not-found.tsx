import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	console.log(process.env.POLAR_WEBHOOK_SECRET);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="border-b">
					<CardTitle className="text-xl font-normal">
						Page not found
					</CardTitle>
					<CardDescription>
						The page you&apos;re looking for doesn&apos;t exist.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p>Quick links</p>
					<div className="flex flex-col gap-2">
						<Link
							href="/support"
							className="text-muted-foreground underline decoration-dotted">
							Help & support.
						</Link>
						<Link
							href="/transactions"
							className="text-muted-foreground underline decoration-dotted">
							Track transactions.
						</Link>
						<Link
							href="/subscriptions"
							className="text-muted-foreground underline decoration-dotted">
							Track subscriptions.
						</Link>
						<Link
							href="/accounts"
							className="text-muted-foreground underline decoration-dotted">
							Accounts.
						</Link>
						<Link
							href="/pricing"
							className="text-muted-foreground underline decoration-dotted">
							Pricing.
						</Link>
					</div>
				</CardContent>
				<CardFooter className="border-t">
					<Button size="sm" className="ml-auto" asChild>
						<Link href="/home">
							Go to home <ArrowUpRight />
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
