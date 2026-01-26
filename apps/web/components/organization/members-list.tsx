"use client";

import {
    canManageMembers,
    Member,
    useRemoveMember,
    useUpdateMemberRole,
} from "@/lib/organization";
import { avatarUrl } from "@/lib/utils";
import { authClient } from "@budgetbee/core/auth-client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@budgetbee/ui/core/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@budgetbee/ui/core/avatar";
import { Badge } from "@budgetbee/ui/core/badge";
import { Button } from "@budgetbee/ui/core/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@budgetbee/ui/core/dropdown-menu";
import { Skeleton } from "@budgetbee/ui/core/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@budgetbee/ui/core/table";
import { cn, getInitials } from "@budgetbee/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, User } from "lucide-react";
import { useState } from "react";

interface MembersListProps {
    currentUserRole?: "owner" | "admin" | "editor" | "viewer";
}

export const roleBadgeVariants = {
    owner: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    admin: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    editor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    viewer: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export function MembersList({ currentUserRole }: MembersListProps) {
    const { data: activeMember, isPending: isActiveMemberLoading } =
        authClient.useActiveMember();

    const { data: allMembers, isLoading } = useQuery({
        queryKey: ["organizations", "members", activeMember?.organizationId],
        queryFn: async () => {
            const res = await authClient.organization.listMembers();
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        enabled: !!activeMember?.organizationId,
    });

    const { mutateAsync: updateRole, isPending: isUpdatingRole } =
        useUpdateMemberRole();
    const { mutateAsync: removeMember, isPending: isRemoving } =
        useRemoveMember();

    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
    const canManage = canManageMembers(currentUserRole);

    const handleRoleChange = async (
        memberId: string,
        newRole: "admin" | "editor" | "viewer",
    ) => {
        await updateRole({
            organizationId: activeMember?.organizationId,
            memberId,
            role: newRole,
        });
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        await removeMember({
            organizationId: activeMember?.organizationId,
            memberId: memberToRemove.id,
        });
        setMemberToRemove(null);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    if (!allMembers?.members.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="text-muted-foreground mb-4 h-12 w-12" />
                <h3 className="text-lg font-medium">No members yet</h3>
                <p className="text-muted-foreground mt-1">
                    Invite team members to collaborate on your organization.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader className="bg-secondary">
                    <TableRow>
                        <TableHead className="text-xs">Member</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Role</TableHead>
                        <TableHead className="text-xs">Joined</TableHead>
                        {canManage && (
                            <TableHead className="w-[50px]"></TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allMembers?.members?.map(member => {
                        const isCurrentUser =
                            member.userId === activeMember?.userId;
                        const isOwner = member.role === "owner";

                        return (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-6">
                                            <AvatarImage
                                                src={avatarUrl(
                                                    member.user.image,
                                                )}
                                                alt={member.user.name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(member.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {member.user.name}
                                                {isCurrentUser && (
                                                    <span className="text-muted-foreground ml-2 text-xs">
                                                        (you)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <p className="text-muted-foreground">
                                        {member.user.email}
                                    </p>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "gap-1 capitalize",
                                            roleBadgeVariants[member.role],
                                        )}>
                                        {member.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        member.createdAt,
                                    ).toLocaleDateString()}
                                </TableCell>
                                {canManage && (
                                    <TableCell>
                                        {!isOwner && !isCurrentUser && (
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
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger
                                                            disabled={
                                                                isUpdatingRole
                                                            }>
                                                            Change role
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleRoleChange(
                                                                        member.id,
                                                                        "admin",
                                                                    )
                                                                }
                                                                disabled={
                                                                    member.role ===
                                                                    "admin"
                                                                }>
                                                                Admin
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleRoleChange(
                                                                        member.id,
                                                                        "editor",
                                                                    )
                                                                }
                                                                disabled={
                                                                    member.role ===
                                                                    "editor"
                                                                }>
                                                                Editor
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleRoleChange(
                                                                        member.id,
                                                                        "viewer",
                                                                    )
                                                                }
                                                                disabled={
                                                                    member.role ===
                                                                    "viewer"
                                                                }>
                                                                Viewer
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setMemberToRemove(
                                                                member,
                                                            )
                                                        }>
                                                        Remove member
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

            <AlertDialog
                open={!!memberToRemove}
                onOpenChange={() => setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <span className="font-semibold">
                                {memberToRemove?.user.name}
                            </span>{" "}
                            from this organization? They will lose access to all
                            organization resources.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction asChild>
                            <Button
                                disabled={isRemoving}
                                variant="destructive"
                                isLoading={isRemoving}
                                onClick={handleRemoveMember}>
                                {isRemoving ? "Removing..." : "Remove member"}
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
