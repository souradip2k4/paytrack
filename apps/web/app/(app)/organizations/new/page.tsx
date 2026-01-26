"use client";

import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function NewOrganizationPage() {
    const router = useRouter();
    const [open, setOpen] = useState(true);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            router.back();
        }
    };

    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <CreateOrganizationDialog open={open} onOpenChange={handleOpenChange} />
        </div>
    );
}
