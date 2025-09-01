"use client";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { Button } from "./ui/button";

export function CategoriesDialog() {
	const open = useStore(s => s.modal_subscription_open);
	return (
		<Dialog
			open={open}
			onOpenChange={() =>
				useStore.setState(s => ({
					modal_subscription_open: !s.modal_subscription_open,
				}))
			}>
			<DialogContent className="md:min-w-4xl gap-0 p-0 md:max-w-4xl">
				<DialogHeader className="border-b p-6 pb-3">
					<DialogTitle className="font-normal">
						New subscription
					</DialogTitle>
				</DialogHeader>

				<form className="flex flex-col gap-3 p-6">
					<div className="space-y-2">
						<div className="relative">
							<Input
								className="peer pe-12 ps-12"
								placeholder="Transaction amount (eg, -57.21)"
								type="text"
							/>
						</div>
					</div>
				</form>

				<DialogFooter className="border-t p-3">
					<DialogClose asChild>
						<Button
							variant="secondary"
							size="sm"
							//onClick={() => reset()}
						>
							Cancel
						</Button>
					</DialogClose>
					<Button
						//disabled={!isValid}
						//isLoading={isPending}
						//onClick={handleSubmit(onSubmit)}
						size="sm"
						type="submit">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
