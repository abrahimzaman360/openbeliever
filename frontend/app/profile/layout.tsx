import LeftMenu from "@/components/feed/left-menu";
import NestedNavbar from "@/components/shared/nested-navbar";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `My Profile`,
    description: `Here you can view your profile.`,
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main suppressHydrationWarning>
      <div className="mx-auto flex w-full flex-col lg:flex-row justify-between">
        {/* Left Sidebar - Navigation */}
        <LeftMenu />

        {/* Center - Post Feed */}
        <div className="flex flex-col w-full">
          <NestedNavbar />
          <div>{children}</div>
        </div>
      </div>
    </main>
  );
}
