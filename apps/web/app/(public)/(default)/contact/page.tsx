import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
	return (
		<section className="flex w-full flex-col items-center justify-center gap-8 px-8 py-16">
			<h1>Contact Us</h1>
			<Card className="w-full md:max-w-[480px]">
				<CardHeader>
					<CardTitle>Get in touch</CardTitle>
					<CardDescription>
						Fill this form and we will reach out to you.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
						action="https://docs.google.com/forms/d/e/1FAIpQLScJK9VoDaFsxloPIdOmsXUIjY-Br39khMNvEuHgggZq2M3xlg/formResponse">
						<div className="space-y-2">
							<Label htmlFor="entry.2005620554">Full name</Label>
							<Input
								name="entry.2005620554"
								placeholder="Your full name"
								required={true}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="entry.1045781291">Email</Label>
							<Input
								name="entry.1045781291"
								placeholder="Your email"
								required={true}
								type="email"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="entry.1338138720">Message</Label>
							<Textarea
								name="entry.1338138720"
								placeholder="Your message"
								required={true}
							/>
						</div>
						<Button type="submit" size="lg">
							Send message
						</Button>
					</form>
				</CardContent>
			</Card>
		</section>
	);
}
