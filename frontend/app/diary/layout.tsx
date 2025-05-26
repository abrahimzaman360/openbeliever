import LeftMenu from "@/components/feed/left-menu";
import React from "react";

export default function DiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main suppressHydrationWarning>
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex w-full flex-col lg:flex-row justify-between">
          {/* Left Sidebar - Navigation */}
          <LeftMenu />

          {/* Center - Post Feed */}
          <div className="h-[calc(100vh-65px)] w-full">{children}</div>
        </div>
      </div>
    </main>
  );
}
