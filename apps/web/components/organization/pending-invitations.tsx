"use client";

import { useAcceptInvitation, useRejectInvitation } from "@/lib/organization";
import { authClient } from "@budgetbee/core/auth-client";
import { Badge } from "@budgetbee/ui/core/badge";
import { Button } from "@budgetbee/ui/core/button";
import { Card, CardContent } from "@budgetbee/ui/core/card";
import { useQuery } from "@tanstack/react-query";
import { Building2, Check, Clock, X } from "lucide-react";
import React from "react";

export function PendingInvitations() {
    const { data: invitations, isLoading } = useQuery({
        queryKey: ["organizations", "invitations", "pending"],
        queryFn: async () => {
            const res = await authClient.organization.listUserInvitations();
            if (res.error) throw res.error;
            return res.data.filter(i => i.status === "pending");
        },
    });

    const { mutateAsync: acceptInvitation, isPending: isAccepting } =
        useAcceptInvitation();
    const { mutateAsync: rejectInvitation, isPending: isRejecting } =
        useRejectInvitation();

    const getTimeRemaining = (expiresAt: Date) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return "Expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );

        if (days > 0) return `Expires in ${days} day${days > 1 ? "s" : ""}`;
        return `Expires in ${hours} hour${hours > 1 ? "s" : ""}`;
    };

    if (!invitations?.length) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Pending Invitations</h3>
                <Badge variant="secondary" className="rounded-full">
                    {invitations.length}
                </Badge>
            </div>

            <div className="grid gap-4">
                {invitations.map(invitation => (
                    <Card
                        key={invitation.id}
                        className="border-l-primary overflow-hidden border-l-4">
                        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                                <Building2 className="text-primary h-6 w-6" />
                            </div>

                            <div className="flex-1 space-y-1">
                                <p className="font-medium">
                                    You've been invited to join an organization
                                </p>
                                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                                    <Badge
                                        variant="outline"
                                        className="capitalize">
                                        {invitation.role}
                                    </Badge>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {getTimeRemaining(invitation.expiresAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rejectInvitation(invitation.id)}
                                    disabled={isAccepting || isRejecting}>
                                    <X className="mr-1 h-4 w-4" />
                                    Decline
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => acceptInvitation(invitation.id)}
                                    disabled={isAccepting || isRejecting}
                                    isLoading={isAccepting}>
                                    <Check className="mr-1 h-4 w-4" />
                                    Accept
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
