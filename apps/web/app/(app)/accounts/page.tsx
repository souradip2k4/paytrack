import { DeleteAccountConfirmationModal } from "@/components/accounts/delete-account-confirmation-modal";
import { EditProfile } from "@/components/accounts/edit-profile";
import { SessionsList } from "@/components/accounts/sessions-list";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
	return (
		<div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 p-4 py-8 md:grid-cols-2">
			<div>
				<h3>Profile</h3>
			</div>
			<EditProfile />
			<Separator className="col-span-2 my-4" />

			<div className="col-span-2">
				<SessionsList />
			</div>

			<Separator className="col-span-2 my-4" />

			<Card className="bg-destructive/10 border-destructive/25 col-span-2">
				<CardHeader className="border-destructive/25 border-b">
					<CardTitle className="font-normal">
						Delete personal account.
					</CardTitle>
					<CardDescription>
						Permanently delete your account and all associated data.
						This step is{" "}
						<span className="text-destructive">irreversible</span>.
						It is highly recommended to export your data first.
					</CardDescription>
				</CardHeader>
				<CardFooter className="flex justify-end">
					<DeleteAccountConfirmationModal />
				</CardFooter>
			</Card>
		</div>
	);
}
