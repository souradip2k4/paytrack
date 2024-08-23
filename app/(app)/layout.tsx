import { H1 } from "@/components/ui/typography";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Fragment>
      <div className="border-b h-[56px] flex items-center justify-between px-8">
        <H1 className="text-lg">BudgetBee.</H1>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      <div className="h-[calc(100vh-56px)] w-full absolute grid grid-cols-[240px_1fr]">
        <div className="border-r flex flex-col pt-8 gap-4">
          <a className="w-full justify-start px-8" href="/entries">
            Entries
          </a>
          <a className="w-full justify-start px-8" href="/dashboard">
            Dashboard
          </a>
          <a className="w-full justify-start px-8" href="/categories">
            Categories &amp; tags
          </a>
          <a className="w-full justify-start px-8" href="/api-keys">
            API Keys
          </a>
          <a className="w-full justify-start px-8" href="/settings">
            Settings
          </a>
        </div>
        {children}
      </div>
    </React.Fragment>
  );
}
