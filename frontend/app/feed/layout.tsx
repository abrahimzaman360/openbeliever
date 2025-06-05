import LeftMenu from "@/components/feed/left-menu";
import RightSideBar from "@/components/feed/right-side";

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Your Feed`,
    description: `Explore the latest posts from your friends and communities.`,
  };
}

export default function FeedLayout({
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
          <div className="h-[calc(100vh-65px)] w-full">
            <div className="w-full max-w-full flex flex-row items-center justify-center py-4 border-b">
              <h1 className="font-bold text-md">Your Home Feed</h1>
            </div>
            {children}
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <RightSideBar />
        </div>
      </div>
    </main>
  );
}
