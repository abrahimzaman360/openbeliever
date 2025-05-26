import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/lib/providers/query-provider";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import NetworkConnectivity from "@/components/shared/network-manager";
import MoveTop from "@/components/shared/move-up";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const metadata: Metadata = {
  title: {
    default: "OpenBeliever - Social Media Platform",
    template: "%s - OpenBeliever",
  },
  description:
    "Join OpenBeliever to connect with learners, share knowledge, and grow together. Create collaborative posts, track your learning journey, and earn achievements in a vibrant community of lifelong learners.",
  keywords: [
    "social learning",
    "collaborative learning",
    "knowledge sharing",
    "learning community",
    "educational platform",
    "skill development",
    "learning tracking",
    "achievements",
    "learning paths",
    "collaborative posts",
    "openbeliever",
    "open believer",
    "open believer.com",
  ],
  applicationName: "OpenBeliever",
  appleWebApp: {
    capable: true,
    title: "OpenBeliever - Social Learning Platform",
    statusBarStyle: "default",
  },
  appLinks: {
    web: {
      url: "https://openbeliever.com",
      should_fallback: true,
    },
  },
  authors: [
    { name: "OpenBeliever", url: "https://openbeliever.com" },
    {
      name: "Ibrahim Zaman",
      url: "https://mrtux.one",
    },
    {
      name: "Jimin Wong",
      url: "https://www.youtube.com/@지민카세",
    },
  ],
  metadataBase: new URL("https://openbeliever.com"),
  publisher: "OpenBeliever",
  referrer: "origin-when-cross-origin",
  archives: ["https://openbeliever.com/history/blog"],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://openbeliever.com",
  },
  category: "technology",
  creator: "OpenBeliever",
  bookmarks: ["https://openbeliever.com", "https://openbeliever.com/profile"],
  generator: "Next.js",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "google",
    yandex: "yandex",
    yahoo: "yahoo",
    me: ["@openbeliever360", "@openbeliever", "@mrtux360", "@abrahimzaman360"],
  },
  openGraph: {
    title: "OpenBeliever - Transform Your Learning Journey",
    description:
      "Connect, Learn, and Grow with OpenBeliever - The Social Learning Platform",
    images: ["/og-image.jpg"],
    url: "https://openbeliever.com",
    siteName: "OpenBeliever",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBeliever - Social Learning Platform",
    description:
      "Join a community of learners sharing knowledge and growing together",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressContentEditableWarning suppressHydrationWarning>
      <body className={`antialiased`}>
        <QueryProvider>
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-screen">
                <Loader2 className="animate-spin" />
              </div>
            }>
            <AuthProvider>{children}</AuthProvider>
            <NetworkConnectivity />
            <MoveTop />
          </Suspense>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryProvider>
        <Toaster
          position="top-right"
          visibleToasts={3}
          duration={2000}
          expand
          pauseWhenPageIsHidden
        />
      </body>
    </html>
  );
}
