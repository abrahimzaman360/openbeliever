"use client";

import type React from "react";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  ChevronRight,
  Home,
  Lock,
  Shield,
  User,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import LeftMenu from "@/components/feed/left-menu";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const navItems = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/settings/profile",
    },
    {
      title: "Account",
      href: "/settings/account",
      icon: <Lock className="h-5 w-5" />,
      active: pathname === "/settings/account",
    },
    {
      title: "Privacy",
      href: "/settings/privacy",
      icon: <Shield className="h-5 w-5" />,
      active: pathname === "/settings/privacy",
    },
    {
      title: "Professional",
      href: "/settings/professional",
      icon: <BarChart className="h-5 w-5" />,
      active: pathname === "/settings/professional",
    },
    {
      title: "Danger Zone",
      href: "/settings/danger-zone",
      icon: <AlertCircle className="h-5 w-5" />,
      active: pathname === "/settings/danger-zone",
      className: "text-destructive",
    },
  ];

  return (
    <div
      className="min-h-screen bg-background"
    >
      <div
        className="flex"
      >
        <div className="border-r">
          <LeftMenu className="lg:w-full" />
        </div>
        {/* Center - Post Feed */}
        <div className="border-x border-border w-full">
          <div className="border-b border-border bg-background p-2 sm:p-4 ">
            <Link href={isMobile ? "/feed" : "/settings"} className="font-bold">
              {isMobile ? "Return to Home" : "Settings"}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Sidebar Navigation for Desktop */}
            <div className="hidden md:block max-w-xs w-full border-r p-2">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", item.className)}>
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                      {item.active && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <main className="h-full max-w-4xl w-full">{children}</main>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t py-2 px-6 z-10">
                <div className="flex flex-row justify-between items-center gap-0.5">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col items-center justify-between">
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center py-1",
                          item.active
                            ? "text-primary"
                            : "text-muted-foreground",
                          item.className
                        )}>
                        {item.icon}
                        <span className="text-xs mt-1">{item.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
