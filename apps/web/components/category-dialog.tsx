"use client";

import { CATEGORY_COLORS, COLORS } from "@/lib/hash";
import { useCategoryMutation } from "@/lib/query";
import { useLocalSettingsStore, useStore } from "@/lib/store";
import { Button } from "@budgetbee/ui/core/button";
import { Checkbox } from "@budgetbee/ui/core/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@budgetbee/ui/core/dialog";
import { Input } from "@budgetbee/ui/core/input";
import { Label } from "@budgetbee/ui/core/label";
import { cn } from "@budgetbee/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import React, { useId } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const schema = z.object({
    name: z.string().min(2, "Category name must be more than 2 characters."),
    color: z.string(),
});

type FieldValues = z.infer<typeof schema>;

export function CategoryDialog() {
    const {
        category_create_dialog_open: isCreateCategoryDialogOpen,
        category_create_dialog_set_open: setIsCreateCategoryDialogOpen,
        category_create_dialog_type: type,
        category_create_dialog_data: payload,
    } = useStore();

    const {
        create_category_can_create_more: createMore,
        create_category_set_can_create_more: setCreateMore,
        confirmation_dialog_delete_category_hidden: confirmationDialogDeleteCategoryHidden,
        set_confirmation_dialog_delete_category_hidden: setConfirmationDialogDeleteCategoryHidden,
    } = useLocalSettingsStore();

    const categoryInputId = useId();
    const createMoreCheckboxId = useId();
    const cascadeDeleteCheckboxId = useId();
    const { mutateAsync: manageCategory, isPending } = useCategoryMutation();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isLoading, isDirty },
        watch,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            color: (COLORS[Math.floor(Math.random() * COLORS.length)] as string),
        },
    });

    const cl = watch("color");
    React.useEffect(() => {
        console.log(cl);
    }, [cl]);

    React.useEffect(() => {
        console.log(isDirty);
    }, [isDirty]);

    React.useEffect(() => {
        if (isCreateCategoryDialogOpen) {
            reset({
                // @ts-ignore
                name: payload?.name || "",
                color:
                    // @ts-ignore
                    payload?.color ||
                    (COLORS[Math.floor(Math.random() * COLORS.length)] as string),
            });
        }
    }, [isCreateCategoryDialogOpen, payload, reset]);

    const color = watch("color");
    const [cascadeDelete, setCascadeDelete] = React.useState(false);

    const [dontShowAgain, setDontShowAgain] = React.useState(false);
    const dontShowAgainCheckboxId = useId();

    const onSubmit = async (fv: FieldValues) => {
        if (type === "delete" && dontShowAgain) {
            setConfirmationDialogDeleteCategoryHidden(true);
        }

        if (type === "create") {
            await manageCategory({
                type: "create",
                payload: {
                    name: fv.name,
                    color: fv.color,
                }
            });
        } else if (type === "update" && payload?.id) {
            await manageCategory({
                type: "update",
                payload: {
                    id: payload.id,
                    name: fv.name,
                    color: fv.color,
                }
            });
        } else if (type === "delete" && payload?.id) {
            await manageCategory({
                type: "delete",
                payload: {
                    id: payload.id,
                    cascade: cascadeDelete
                }
            });
        }

        reset({
            name: "",
            color: COLORS[Math.floor(Math.random() * COLORS.length)] as string,
        });

        if (type !== "create" || (type === "create" && !createMore)) {
            setIsCreateCategoryDialogOpen(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!payload?.id) return;

        if (dontShowAgain) {
            setConfirmationDialogDeleteCategoryHidden(true);
        }

        await manageCategory({
            type: "delete",
            payload: {
                id: payload.id,
                cascade: cascadeDelete
            }
        });

        setIsCreateCategoryDialogOpen(false);
    };



    return (
        <Dialog
            open={isCreateCategoryDialogOpen}
            onOpenChange={setIsCreateCategoryDialogOpen}>
            <DialogContent className="md:min-w-2xl gap-0 p-0 md:max-w-2xl">
                <form onSubmit={handleSubmit(onSubmit)} className="contents">
                    <DialogHeader className="border-b p-4 px-6">
                        <DialogTitle>
                            {type === "create" && "Create Category"}
                            {type === "update" && "Edit Category"}
                            {type === "delete" && "Delete Category"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 p-6">
                        {type === "delete" ? (
                            <div className="flex flex-col gap-4">
                                <p className="text-muted-foreground text-sm">
                                    Are you sure you want to delete this category? This action cannot be undone.
                                </p>
                                <div className="flex items-center gap-2 pt-1">
                                    <Checkbox
                                        id={cascadeDeleteCheckboxId}
                                        checked={cascadeDelete}
                                        onCheckedChange={(c) => setCascadeDelete(!!c)}
                                    />
                                    <Label htmlFor={cascadeDeleteCheckboxId}>Also delete all transactions in this category.</Label>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <Checkbox
                                        id={dontShowAgainCheckboxId}
                                        checked={dontShowAgain}
                                        onCheckedChange={(c) => setDontShowAgain(!!c)}
                                    />
                                    <Label htmlFor={dontShowAgainCheckboxId}>Don't show this dialog again.</Label>
                                </div>
                            </div>
                        ) : (
                            <React.Fragment>
                                <div className="flex flex-col gap-2">
                                    <Label
                                        htmlFor={categoryInputId}
                                        className="text-muted-foreground">
                                        Name
                                    </Label>
                                    <Input
                                        id={categoryInputId}
                                        placeholder="e.g. Utilities"
                                        {...register("name")}
                                    />
                                    {errors.name && (
                                        <p className="text-destructive text-sm">
                                            {String(errors.name.message)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(colorName => {
                                        const c = CATEGORY_COLORS[colorName];
                                        if (!c) return null;
                                        return (
                                            <button
                                                type="button"
                                                key={colorName}
                                                className={cn(
                                                    "flex size-6 items-center justify-center rounded-md border transition-all hover:scale-110",
                                                    "border-[var(--badge-text)] bg-[var(--badge-fill)] text-[var(--badge-text)]",
                                                    "dark:border-[var(--badge-text-dark)] dark:bg-[var(--badge-fill-dark)] dark:text-[var(--badge-text-dark)]",
                                                    colorName === color ?
                                                        "ring-offset-background ring-1"
                                                        : "opacity-70 hover:opacity-100",
                                                )}
                                                style={
                                                    {
                                                        "--badge-fill": c.light.fill,
                                                        "--badge-text": c.light.text,
                                                        "--badge-fill-dark":
                                                            c.dark.fill,
                                                        "--badge-text-dark":
                                                            c.dark.text,
                                                    } as React.CSSProperties
                                                }
                                                onClick={() =>
                                                    // @ts-ignore
                                                    setValue("color", colorName, {
                                                        shouldDirty: true,
                                                    })
                                                }
                                                title={c.name}>
                                                <Check
                                                    className="size-4"
                                                    visibility={
                                                        colorName === color ? "visible"
                                                            : "hidden"
                                                    }
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                    <DialogFooter className="border-t p-3">
                        {type === "create" && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={createMoreCheckboxId}
                                    checked={createMore}
                                    onCheckedChange={c => setCreateMore(Boolean(c))}
                                />
                                <Label
                                    className="text-muted-foreground text-xs font-normal"
                                    htmlFor={createMoreCheckboxId}>
                                    Create more
                                </Label>
                            </div>
                        )}
                        <Button
                            className="ml-3"
                            type={type === "delete" ? "button" : "submit"}
                            onClick={type === "delete" ? handleDelete : undefined}
                            disabled={type === "update" ? !isDirty : false}
                            variant={type === "delete" ? "destructive" : "default"}
                            isLoading={isLoading || isPending}
                            size="sm">
                            {type === "create" && "Create"}
                            {type === "update" && "Save changes"}
                            {type === "delete" && "Delete"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
