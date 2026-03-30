import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for NextAuth session token cookie
  const token =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token") ||
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/enquiries/:path*",
    "/orders/:path*",
    "/pricing/:path*",
    "/proposals/:path*",
    "/invoices/:path*",
    "/wholesale/:path*",
    "/production/:path*",
    "/delivery/:path*",
    "/libraries/:path*",
    "/settings/:path*",
    "/subscription/:path*",
    "/user/:path*",
  ],
};
