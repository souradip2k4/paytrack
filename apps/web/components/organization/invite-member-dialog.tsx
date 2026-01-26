"use client";

import { useInviteMember } from "@/lib/organization";
import { Button } from "@budgetbee/ui/core/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@budgetbee/ui/core/select";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["admin", "editor", "viewer"]),
});

type FormValues = z.infer<typeof schema>;

interface InviteMemberDialogProps {
    organizationId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function InviteMemberDialog({
    organizationId,
    open,
    onOpenChange,
}: InviteMemberDialogProps) {
    const emailInputId = useId();
    const roleSelectId = useId();
    const { mutateAsync: inviteMember, isPending } = useInviteMember();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            role: "viewer",
        },
    });

    const onSubmit = async (data: FormValues) => {
        await inviteMember({
            organizationId,
            email: data.email,
            role: data.role,
        });

        reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 p-0">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader className="border-b p-4 px-6">
                        <DialogTitle className="font-normal">
                            Invite a team member
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor={emailInputId} className="text-muted-foreground">Email address</Label>
                            <Input
                                id={emailInputId}
                                type="email"
                                placeholder="john@acmecorp.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-destructive text-sm font-normal">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={roleSelectId} className="text-muted-foreground">Role</Label>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger id={roleSelectId}>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="viewer">Viewer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.role && (
                                <p className="text-destructive text-sm">
                                    {errors.role.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="border-t p-3">
                        <Button type="submit" size="sm" isLoading={isPending} disabled={isPending}>
                            Send invitation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
