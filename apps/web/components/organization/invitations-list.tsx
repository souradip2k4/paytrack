"use client";

import {
    canManageMembers,
    Invitation,
    useCancelInvitation,
} from "@/lib/organization";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@budgetbee/ui/core/alert-dialog";
import { Badge } from "@budgetbee/ui/core/badge";
import { Button } from "@budgetbee/ui/core/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@budgetbee/ui/core/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@budgetbee/ui/core/table";
import { cn } from "@budgetbee/ui/lib/utils";
import { authClient } from "@budgetbee/core/auth-client";
import { useQuery } from "@tanstack/react-query";
import {
    Ban,
    Clock,
    Mail,
    MoreHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import { roleBadgeVariants } from "./members-list";

interface InvitationsListProps {
    organizationId: string;
    currentUserRole?: "owner" | "admin" | "editor" | "viewer";
}

const statusBadgeVariants = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    accepted: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    canceled: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export function InvitationsList({
    currentUserRole,
}: InvitationsListProps) {

    const { data: invitations, isLoading: isInvitationsLoading } = useQuery({
        queryKey: ["organizations", "invitations"],
        queryFn: async () => {
            const res = await authClient.organization.listInvitations();
            if (res.error) throw res.error;
            return res.data;
        },
    });

    const { mutateAsync: cancelInvitation, isPending: isCanceling } =
        useCancelInvitation();

    const [invitationToCancel, setInvitationToCancel] =
        useState<Invitation | null>(null);
    const canManage = canManageMembers(currentUserRole);

    const pendingInvitations = invitations?.filter(i => i.status === "pending");

    const handleCancelInvitation = async (id: string | undefined) => {
        if (!id) return;
        await cancelInvitation(id);
    };

    const isExpired = (expiresAt: Date) => {
        return new Date(expiresAt) < new Date();
    };

    const getTimeRemaining = (expiresAt: Date) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return "Expired";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
        return `${hours} hour${hours > 1 ? "s" : ""} left`;
    };

    if (isInvitationsLoading) {
        return (
            <div className="flex items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!pendingInvitations?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="text-muted-foreground mb-4 size-8" />
                <h3 className="text-lg font-medium">No pending invitations</h3>
                <p className="text-muted-foreground mt-1">
                    All sent invitations have been processed.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader className="bg-secondary">
                        <TableRow>
                            <TableHead className="text-xs">Email</TableHead>
                            <TableHead className="text-xs">Role</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Expires</TableHead>
                            {canManage && <TableHead className="w-[50px]"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingInvitations.map(invitation => {
                            const expired = isExpired(invitation.expiresAt);
                            return (
                                <TableRow
                                    key={invitation.id}
                                    className={expired ? "opacity-50" : ""}>
                                    <TableCell className="text-muted-foreground">{invitation.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn("gap-1 capitalize", roleBadgeVariants[invitation.role])}>{invitation.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "capitalize",
                                                expired ?
                                                    statusBadgeVariants.canceled
                                                    : statusBadgeVariants[invitation.status]
                                            )}>
                                            {expired ? "Expired" : invitation.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                            <Clock className="h-3 w-3" />
                                            {getTimeRemaining(invitation.expiresAt)}
                                        </div>
                                    </TableCell>
                                    {canManage && (
                                        <TableCell>
                                            {!expired && invitation.status === "pending" && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() =>
                                                                setInvitationToCancel(invitation)
                                                            }>
                                                            <Ban className="size-4" />
                                                            Cancel invitation
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={!!invitationToCancel}
                onOpenChange={() => setInvitationToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel the invitation for{" "}
                            <span className="italic">
                                {invitationToCancel?.email}
                            </span>
                            ? They will no longer be able to join your organization with
                            this invitation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            disabled={isCanceling}
                            asChild
                        >
                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={isCanceling}
                                isLoading={isCanceling}
                                onClick={() => handleCancelInvitation(invitationToCancel?.id)}
                            >
                                Cancel invitation
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
