import LeftMenu from "@/components/feed/left-menu";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Diary",
  description: "Your personal diary",
};

export default function DiaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
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
