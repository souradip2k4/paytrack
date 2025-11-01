"use client";

import { authClient } from "@budgetbee/core/auth-client";
import { Button } from "@budgetbee/ui/core/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import Link from "next/link";
import React from "react";

export function DeleteAccountConfirmationModal() {
	const [confirmation, setConfirmation] = React.useState("");
	const [isDeleting, startTransition] = React.useTransition();

	const handleDeleteAccount = () => {
		startTransition(async () => {
			await authClient.deleteUser().then(() => {
				authClient.signOut();
			});
		});
	};

	return (
		<Dialog>
			<DialogTrigger>
				<Button variant="destructive" size="sm">
					Delete account
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader className="border-b pb-4">
					<DialogTitle className="font-normal">
						Delete account
					</DialogTitle>
					<DialogDescription>
						Permanently delete your account and all associated data.
						This step is irreversible. It is highly recommended to
						export your data first.
						<br />
						<br />
						<span className="italic text-amber-500">
							We do retain your subscription information until the
							active subscription period ends. If you wish to
							delete it immedietly,{" "}
							<Link
								className="underline decoration-dotted"
								href="/support">
								contact support
							</Link>
							.
						</span>
					</DialogDescription>
				</DialogHeader>

				<div className="my-4">
					<div className="space-y-4">
						<Label>
							To verify, type <b>“delete my account”</b> below:
						</Label>
						<Input
							value={confirmation}
							onChange={e => setConfirmation(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button size="sm" variant="secondary">
							Cancel
						</Button>
					</DialogClose>
					<Button
						size="sm"
						disabled={confirmation !== "delete my account"}
						variant="destructive"
						isLoading={isDeleting}
						onClick={() => handleDeleteAccount()}>
						Delete account
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
