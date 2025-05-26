import LeftMenu from "@/components/feed/left-menu";
import RightSideBar from "@/components/feed/right-side";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { BellPlus } from "lucide-react";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Feed`,
    description: `Here you can view your profile.`,
  };
}

export default function NotificationsLayout({
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
          <div className="border-x border-border w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BellPlus className="h-6 w-6 text-blue-700" />
                <h1 className="text-xl font-bold">Notifications</h1>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)] w-full p-2">
              {children}
            </ScrollArea>
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <RightSideBar />
        </div>
      </div>
    </main>
  );
}
