import { Button } from "@budgetbee/ui/core/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@budgetbee/ui/core/card";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
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
							href="https://nocodb.sammaji.com/dashboard/#/nc/form/780055c9-89b3-4c1f-825b-2fca58cd2336"
							className="text-muted-foreground underline decoration-dotted">
							Help and support.
						</Link>
						<Link
							href={
								process.env.NEXT_PUBLIC_APP_URL +
								"/transactions"
							}
							className="text-muted-foreground underline decoration-dotted">
							Track transactions.
						</Link>
						<Link
							href={
								process.env.NEXT_PUBLIC_APP_URL +
								"/subscriptions"
							}
							className="text-muted-foreground underline decoration-dotted">
							Track subscriptions.
						</Link>
						<Link
							href={process.env.NEXT_PUBLIC_APP_URL + "/accounts"}
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
						<Link href={process.env.NEXT_PUBLIC_APP_URL + "/home"}>
							Go to home <ArrowUpRight />
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
