import LeftMenu from "@/components/feed/left-menu";
import NestedNavbar from "@/components/shared/nested-navbar";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Messages`,
    description: `Here you can view and create conversations with other users.`,
  };
}

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex w-full flex-col lg:flex-row justify-between">
          {/* Left Sidebar - Navigation */}
          <div className="hidden max-w-xs w-full sm:block">
            <LeftMenu />
          </div>

          {/* Center - Post Feed */}
          <div className="h-screen w-full flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
