import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SERVER_URL } from "@/lib/server";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionKey = cookieStore.get("openbeliever-machine");

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/auth");
  const isBlogPage = pathname.startsWith("/blog");
  const isLandingPage = pathname === "/"; // Only match exactly "/"

  // ✅ Allow access to landing page ("/") and blog pages
  if (isLandingPage || isBlogPage) {
    return NextResponse.next();
  }

  // If the user is authenticated, verify session
  if (sessionKey) {
    const verifyResponse = await fetch(`${SERVER_URL}/api/account/verify`, {
      headers: { Cookie: `${cookieStore.toString()}` },
      credentials: "include",
    });

    const isValid = verifyResponse.ok;

    // Redirect invalid sessions to login
    if (!isValid && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

    // Redirect authenticated users away from auth pages
    if (isValid && isAuthPage) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!sessionKey && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/auth/:path*",
  ],
};
