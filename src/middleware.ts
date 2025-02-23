import {
  getKindeServerSession,
  withAuth,
} from "@kinde-oss/kinde-auth-nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated } = getKindeServerSession();

  // Handle root path
  if (pathname === "/") {
    const authenticated = await isAuthenticated();
    if (authenticated) {
      const redirectUrl = new URL("/chat", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Handle chat routes
  if (pathname.startsWith("/chat")) {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return withAuth(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/chat", "/chat/:path*"],
};
