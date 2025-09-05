import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import React from "react";

export default function Layout({
    children,
}: {
    children: Readonly<React.ReactNode>;
}) {
    return (
        <div
            style={{
                background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 60%), transparent",
            }}
        >
            <Navbar />
            {children}
            <aside className="border-t px-4 py-8 lg:px-16 lg:py-16">
                <Footer />
            </aside>
        </div>
    );
}
