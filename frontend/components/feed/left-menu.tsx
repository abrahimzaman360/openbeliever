"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Users,
  User,
  Menu,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/providers/auth-provider";
import CreatePostComponent from "../post/post-create";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import UserProfilePopup from "./profile-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FeedMenuSkeleton from "../skeleton/feedmenu-skeleton";

export default function LeftMenu({ className }: { className?: string }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { id: 1, href: "/feed", icon: Home, label: "Home" },
    { id: 2, href: "/diary", icon: Bookmark, label: "My Diary" },
    { id: 3, href: "/messages", icon: Mail, label: "Messages" },
    { id: 4, href: "/notifications", icon: Bell, label: "Notifications" },
    { id: 5, href: "/profile", icon: User, label: "Profile" },
  ];

  const navItemsMobile = [
    { id: 1, href: "/feed", icon: Home, label: "Home" },
    { id: 2, href: "/diary", icon: Bookmark, label: "My Diary" },
    { id: 3, href: "/messages", icon: Mail, label: "Messages" },
    { id: 4, href: "/notifications", icon: Bell, label: "Notifications" },
    { id: 5, href: "/profile", icon: User, label: "Profile" },
    { id: 6, href: "/settings/profile", icon: Settings, label: "Settings" },
  ];

  if (isLoading || !user) {
    return <FeedMenuSkeleton className={className!} />;
  }

  return (
    <>
      <div
        className={cn(
          "sticky top-0 h-screen p-4 hidden lg:block border-x border-border max-w-xs w-full"
        )}>
        <div className="flex h-full flex-col space-y-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary"></div>
            <span className="text-xl font-bold">OpenBeliever</span>
          </div>

          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "rounded-full justify-start",
                    isActive && "bg-muted text-primary"
                  )}
                  asChild>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          <CreatePostComponent currentUser={user} />

          <UserProfilePopup currentUser={user!} />
        </div>
      </div>

      {/* MOBILE MENU */}
      {!pathname.startsWith("/settings") && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t max-w-xl w-full sm:hidden">
          <div className="flex justify-around items-center h-16">
            {navItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center p-2",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center justify-center h-full p-2">
                  <Menu className="h-6 w-6" />
                  <span className="text-xs mt-1">More</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[20vh] rounded-t-md">
                <SheetTitle className="hidden">Menu</SheetTitle>
                <div className="grid grid-cols-4 gap-4 py-6">
                  {navItemsMobile.slice(4).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex flex-col items-center justify-center p-3 group">
                      <item.icon className="h-6 w-6 mb-2 group-hover:fill-gray-200" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}
    </>
  );
}
