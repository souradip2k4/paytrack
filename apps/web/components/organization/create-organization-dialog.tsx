"use client";

import { useCreateOrganization } from "@/lib/organization";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
    name: z
        .string()
        .min(2, "Organization name must be at least 2 characters")
        .max(50, "Organization name must be less than 50 characters"),
    slug: z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .max(30, "Slug must be less than 30 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Slug can only contain lowercase letters, numbers, and hyphens"
        )
        .optional()
        .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const toSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30);

interface CreateOrganizationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({
    open,
    onOpenChange,
}: CreateOrganizationDialogProps) {
    const router = useRouter();
    const nameInputId = useId();
    const slugInputId = useId();
    const { mutateAsync: createOrg, isPending } = useCreateOrganization();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            slug: "",
        },
    });

    const name = watch("name");

    // Auto-generate slug from name
    React.useEffect(() => {
        if (name) {
            setValue("slug", toSlug(name));
        }
    }, [name, setValue]);

    const onSubmit = async (data: FormValues) => {
        const normalizedSlug = data.slug?.trim() || toSlug(data.name);
        const result = await createOrg({
            name: data.name.trim(),
            slug: normalizedSlug,
        });

        if (result) {
            reset();
            onOpenChange(false);
            router.push("/organizations/settings");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader className="border-b p-4 px-6">
                        <DialogTitle className="font-normal">
                            Create a new organization
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-6 p-6">
                        <div className="space-y-2">
                            <Label htmlFor={nameInputId} className="text-muted-foreground">Organization name</Label>
                            <Input
                                id={nameInputId}
                                placeholder="e.g, Acme Inc."
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-destructive text-sm">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={slugInputId} className="text-muted-foreground">
                                URL slug (optional)
                            </Label>
                            <div className="flex rounded-md shadow-xs">
                                <span className="-z-10 inline-flex items-center rounded-s-md border border-input bg-background px-3 text-muted-foreground text-sm">budgetbee.com/org</span>
                                <Input
                                    className="-ms-px rounded-s-none shadow-none"
                                    id={slugInputId}
                                    placeholder="google.com"
                                    type="text"
                                    {...register("slug")}
                                />
                            </div>
                            {errors.slug && (
                                <p className="text-destructive text-sm">
                                    {errors.slug.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="border-t p-3">
                        <Button type="submit" isLoading={isPending}>
                            Create organization
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
