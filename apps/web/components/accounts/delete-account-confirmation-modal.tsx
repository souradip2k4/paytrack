"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
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
                        <span className="text-amber-500 italic">We do retain your subscription information until the active subscription period ends. If you wish to delete it immedietly, <Link className="underline decoration-dotted" href="/support">contact support</Link>.</span>
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
