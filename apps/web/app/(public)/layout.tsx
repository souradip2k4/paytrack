import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Instrument_Serif } from "next/font/google";
import React from "react";

const _Instrument_Serif = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-instrument-serif",
});

export default function Layout({
    children,
}: {
    children: Readonly<React.ReactNode>;
}) {
    return (
        <div>
            <div className="mx-auto flex max-w-5xl justify-center">
                <Navbar />
            </div>
            {children}
            <Footer />
        </div>
    );
}
