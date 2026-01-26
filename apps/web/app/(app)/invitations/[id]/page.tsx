"use client";

import { useAcceptInvitation, useRejectInvitation } from "@/lib/organization";
import { authClient } from "@budgetbee/core/auth-client";
import { Button } from "@budgetbee/ui/core/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@budgetbee/ui/core/card";
import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function InvitationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { data: session, isPending: isSessionLoading } = authClient.useSession();
    const { mutateAsync: acceptInvitation, isPending: isAccepting } =
        useAcceptInvitation();
    const { mutateAsync: rejectInvitation, isPending: isRejecting } =
        useRejectInvitation();

    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (error) {
            router.push("/home")
        }
    }, [error, router])

    const invitationId = React.use(params).id;

    const handleAccept = async () => {
        try {
            await acceptInvitation(invitationId);
            router.push("/organizations/settings")
        } catch (err: any) {
            setError(err.message || "Failed to accept invitation");
        }
    };

    const handleReject = async () => {
        try {
            await rejectInvitation(invitationId);
            router.push("/home")
        } catch (err: any) {
            setError(err.message || "Failed to reject invitation");
        }
    };

    if (isSessionLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    if (error) return null;

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="min-w-md">
                <CardHeader className="border-b">
                    <CardTitle>Organization Invitation</CardTitle>
                    <CardDescription>
                        You've been invited to join an organization. Would you like to
                        accept this invitation?
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="bg-muted/50 rounded-lg border p-4 text-center">
                        <p className="text-muted-foreground text-sm">
                            Signed in as{" "}
                            <span className="font-medium text-foreground">
                                {session?.user?.email}
                            </span>
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="border-t space-x-2">
                    <Button
                        className="ml-auto"
                        variant="destructive"
                        onClick={handleReject}
                        isLoading={isRejecting}
                        disabled={isAccepting || isRejecting}>
                        <X className="size-4" />
                        Decline
                    </Button>
                    <Button
                        onClick={handleAccept}
                        isLoading={isAccepting}
                        disabled={isAccepting || isRejecting}>
                        <Check className="size-4" />
                        Accept
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
