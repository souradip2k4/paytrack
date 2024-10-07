import React from "react";
import { SidebarLayout } from "@/components/sidebar";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <React.Fragment>
            <SidebarLayout>
                {children}
            </SidebarLayout>
        </React.Fragment>
    );
}
