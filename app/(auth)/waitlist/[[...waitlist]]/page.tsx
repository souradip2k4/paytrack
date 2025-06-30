import LoadingSpinner from "@/components/loading-spinner";
import { ClerkLoaded, ClerkLoading, Waitlist } from "@clerk/nextjs";
import React from "react";

const theme = {
    elements: {
        card: { boxShadow: "none" },
    },
};

export default function PageWaitlist() {
    return (
        <React.Fragment>
            <ClerkLoading>
                <LoadingSpinner />
            </ClerkLoading>
            <ClerkLoaded>
                <Waitlist appearance={theme} />
            </ClerkLoaded>
        </React.Fragment>
    );
}
