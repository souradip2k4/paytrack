"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { bearerHeader } from "@/lib/bearer";
import { db } from "@/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function AddSubscriptionDialog() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const [nextPaymentDate, setNextPaymentDate] = useState("");
	const { data: session } = authClient.useSession();

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async () => {
			const { data, error } = await db(await bearerHeader())
				.from("subscriptions")
				.insert([
					{
						name,
						amount: parseFloat(amount),
						next_payment_date: nextPaymentDate,
						user_id: session?.user.id,
					},
				]);

			if (error) {
				toast.error("Failed to add subscription");
				return;
			}

			toast.success("Subscription added");
			setOpen(false);
			queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Add Subscription</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Subscription</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-right">
							Name
						</Label>
						<Input
							id="name"
							value={name}
							onChange={e => setName(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="amount" className="text-right">
							Amount
						</Label>
						<Input
							id="amount"
							value={amount}
							onChange={e => setAmount(e.target.value)}
							className="col-span-3"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label
							htmlFor="next-payment-date"
							className="text-right">
							Next Payment Date
						</Label>
						<Input
							id="next-payment-date"
							type="date"
							value={nextPaymentDate}
							onChange={e => setNextPaymentDate(e.target.value)}
							className="col-span-3"
						/>
					</div>
				</div>
				<Button
					onClick={() => mutation.mutate()}
					disabled={mutation.isPending}>
					{mutation.isPending ? "Adding..." : "Add"}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
