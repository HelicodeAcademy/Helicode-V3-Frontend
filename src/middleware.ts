import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  //  Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/landingpage") ||
    pathname.includes(".") // catches .svg, .png, etc
  ) {
    return NextResponse.next();
  }

  //  Handle subdomains
  if (hostname.startsWith("app.") && pathname === "/") {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  if (hostname.startsWith("app.")) {
    return NextResponse.rewrite(new URL(`/app${pathname}`, request.url));
  }

  // If accessing app routes from main domain, still route to /app
  if (
    pathname.startsWith("/signup") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-reset-code")
  ) {
    return NextResponse.rewrite(new URL(`/app${pathname}`, request.url));
  }

  //  Default → marketing
  return NextResponse.rewrite(new URL(`/marketing${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
