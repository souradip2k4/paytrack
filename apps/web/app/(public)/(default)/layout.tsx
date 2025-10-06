import React from "react";
import { Instrument_Serif } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const _Instrument_Serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" });

export default function Layout({
    children,
}: {
    children: Readonly<React.ReactNode>;
}) {
    return (
        <div>
            <div className="mx-auto max-w-5xl flex justify-center">
                <Navbar />
            </div>
            {children}
            <Footer />
        </div>
    );
}


{/*<divlanding
			style={{
				background:
					"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.25), transparent 60%), transparent",
			}}>
			<Navbar />
			{children}
			<aside className="border-t px-4 py-8 lg:px-16 lg:py-16">
				<Footer />
			</aside>
		</div>*/}
