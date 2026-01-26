"use client";

import {
    canDeleteOrganization,
    canInviteMembers,
    canUpdateOrganization,
    useActiveOrganization,
    useDeleteOrganization,
    useLeaveOrganization,
    useUpdateOrganization,
    Member,
} from "@/lib/organization";
import { authClient } from "@budgetbee/core/auth-client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@budgetbee/ui/core/alert-dialog";
import { ScrollArea, ScrollBar } from "@budgetbee/ui/core/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@budgetbee/ui/core/tabs";
import { Button } from "@budgetbee/ui/core/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@budgetbee/ui/core/card";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
    Building2,
    LogOut,
    Settings,
    Trash2,
    UserPlus,
    Users,
    BoxIcon,
    UserRoundPlus,
    Bolt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InvitationsList } from "./invitations-list";
import { InviteMemberDialog } from "./invite-member-dialog";
import { MembersList } from "./members-list";
import { Separator } from "@budgetbee/ui/core/separator";

const orgSettingsSchema = z.object({
    name: z
        .string()
        .min(2, "Organization name must be at least 2 characters")
        .max(50, "Organization name must be less than 50 characters"),
});

type OrgSettingsFormValues = z.infer<typeof orgSettingsSchema>;

export function OrganizationSettings() {
    const router = useRouter();
    const nameInputId = useId();

    const { data: session } = authClient.useSession();
    const { data: activeOrganization, isPending: isLoadingActiveOrganization } = useActiveOrganization();

    const { data: allMembers, isPending: isMembersLoading } = useQuery({
        queryKey: ["organizations", "members", activeOrganization?.id],
        queryFn: async () => {
            const res = await authClient.organization.listMembers();
            if (res.error) throw res.error
            return res.data;
        },
    });

    const { mutateAsync: updateOrg, isPending: isUpdating } =
        useUpdateOrganization();
    const { mutateAsync: deleteOrg, isPending: isDeleting } =
        useDeleteOrganization();
    const { mutateAsync: leaveOrg, isPending: isLeaving } = useLeaveOrganization();

    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    const currentMember = allMembers?.members.find(m => m.userId === session?.user?.id);
    const currentUserRole = currentMember?.role;

    const canUpdate = canUpdateOrganization(currentUserRole);
    const canDelete = canDeleteOrganization(currentUserRole);
    const canInvite = canInviteMembers(currentUserRole);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<OrgSettingsFormValues>({
        resolver: zodResolver(orgSettingsSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        if (activeOrganization) {
            reset({ name: activeOrganization.name });
        }
    }, [activeOrganization, reset]);

    const onSubmitSettings = async (data: OrgSettingsFormValues) => {
        if (!activeOrganization?.id) return;
        await updateOrg({
            organizationId: activeOrganization.id,
            name: data.name,
        });
        reset({ name: data.name });
    };

    const handleDeleteOrg = async () => {
        if (!activeOrganization?.id) return;
        await deleteOrg(activeOrganization.id);
        setShowDeleteDialog(false);
        router.push("/home");
    };

    const handleLeaveOrg = async () => {
        if (!activeOrganization?.id) return;
        await leaveOrg(activeOrganization.id);
        setShowLeaveDialog(false);
        router.push("/home");
    };

    if (isLoadingActiveOrganization) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading organization...
                </div>
            </div>
        );
    }

    if (!activeOrganization) {
        router.replace("/home")
        return null
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-4 py-8">
            <div className="flex items-center justify-between">

                <h1 className="text-2xl">{activeOrganization.name}</h1>

                {canInvite && (
                    <Button size="sm" onClick={() => setShowInviteDialog(true)}>
                        <UserPlus className="size-4" />
                        Invite member
                    </Button>
                )}
            </div>

            <Tabs defaultValue="tab-settings">
                <ScrollArea>
                    <TabsList className="mb-3 gap-1 bg-transparent">
                        <TabsTrigger
                            className="rounded-full data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                            value="tab-members"
                        >
                            <Users
                                aria-hidden="true"
                                className="-ms-0.5 me-1.5 opacity-60"
                                size={16}
                            />
                            Members
                        </TabsTrigger>
                        <TabsTrigger
                            className="rounded-full data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                            value="tab-pending-invitations"
                        >
                            <UserRoundPlus
                                aria-hidden="true"
                                className="-ms-0.5 me-1.5 opacity-60"
                                size={16}
                            />
                            Pending invitations
                        </TabsTrigger>
                        <TabsTrigger
                            className="rounded-full data-[state=active]:bg-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                            value="tab-settings"
                        >
                            <Bolt
                                aria-hidden="true"
                                className="-ms-0.5 me-1.5 opacity-60"
                                size={16}
                            />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <TabsContent value="tab-members">
                    <MembersList
                        currentUserRole={currentUserRole}
                    />
                </TabsContent>

                <TabsContent value="tab-pending-invitations">
                    <InvitationsList
                        organizationId={activeOrganization.id}
                        currentUserRole={currentUserRole}
                    />
                </TabsContent>

                <TabsContent value="tab-settings" className="space-y-8">
                    {canUpdate && (
                        <form
                            onSubmit={handleSubmit(onSubmitSettings)}
                            className="space-y-4">
                            <Card>
                                <CardHeader className="border-b">
                                    <CardTitle className="font-normal">Organization Details</CardTitle>
                                    <CardDescription>
                                        Update your organization's basic information.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor={nameInputId} className="text-muted-foreground">Organization name</Label>
                                        <Input
                                            id={nameInputId}
                                            placeholder="Acme Inc."
                                            {...register("name")}
                                        />
                                        {errors.name && (
                                            <p className="text-destructive text-sm">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t">
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        className="ml-auto"
                                        disabled={!isDirty}
                                        isLoading={isUpdating}>
                                        Save changes
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    )}

                    <Separator />

                    <Card className="bg-destructive/10 border-destructive/25 col-span-2">
                        <CardHeader className="border-destructive/25 border-b">
                            <CardTitle className="font-normal">Leave organization</CardTitle>
                            <CardDescription>Remove yourself from this organization.</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end">
                            <Button disabled={isLeaving} variant="destructive" onClick={() => setShowLeaveDialog(true)}>Leave organization</Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-destructive/10 border-destructive/25 col-span-2">
                        <CardHeader className="border-destructive/25 border-b">
                            <CardTitle className="font-normal">Delete your organization</CardTitle>
                            <CardDescription>
                                Permanently delete your organization and all associated data.
                                This step is{" "}
                                <span className="text-destructive">irreversible</span>.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end">
                            <Button disabled={!canDelete} variant="destructive" onClick={() => setShowDeleteDialog(true)}>Delete organization</Button>
                        </CardFooter>
                    </Card>

                </TabsContent>
            </Tabs>

            {/* Invite Member Dialog */}
            <InviteMemberDialog
                organizationId={activeOrganization.id}
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
            />

            {/* Delete Organization Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete organization</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                            <p>
                                This action cannot be undone. This will permanently delete
                                the organization{" "}
                                <span className="font-semibold">{activeOrganization.name}</span> and
                                remove all associated data.
                            </p>
                            <div className="space-y-2">
                                <Label>
                                    Type <span className="font-mono">{activeOrganization.name}</span>{" "}
                                    to confirm:
                                </Label>
                                <Input
                                    value={deleteConfirmation}
                                    onChange={e => setDeleteConfirmation(e.target.value)}
                                    placeholder="Organization name"
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteOrg}
                            disabled={
                                deleteConfirmation !== activeOrganization.name || isDeleting
                            }>
                            {isDeleting ? "Deleting..." : "Delete organization"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Leave Organization Dialog */}
            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave organization</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave{" "}
                            <span className="font-semibold">{activeOrganization.name}</span>? You
                            will lose access to all organization resources and will need
                            to be re-invited to rejoin.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            asChild
                            onClick={handleLeaveOrg}
                            disabled={isLeaving}>
                            <Button variant="destructive" disabled={isLeaving} isLoading={isLeaving}>Leave organization</Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}