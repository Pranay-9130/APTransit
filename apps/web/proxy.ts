import { type NextRequest, NextResponse } from "next/server";

// docs/08 "Web route guards": fast redirect to /login?next= for routes that need login.
// The proxy cannot see apt_rt (Path=/api/v1/auth), so it checks the apt_session marker (D-016).
// This is a UX nicety only: pages check permissions after useMe, and the API is the real check.

export const SESSION_COOKIE = "apt_session";

/** Route prefixes that need a logged in user (permission checks happen in the page). */
export const PROTECTED_PREFIXES = [
  "/book",
  "/tickets",
  "/passes",
  "/free-travel",
  "/account",
  "/updates",
  "/driver",
  "/conductor",
  "/ops",
  "/gov",
  "/admin",
] as const;

export function needsLogin(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!needsLogin(pathname) || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
  return NextResponse.redirect(login);
}

export const config = {
  // Constants only (statically analysed). Keep in sync with PROTECTED_PREFIXES.
  matcher: [
    "/book/:path*",
    "/tickets/:path*",
    "/passes/:path*",
    "/free-travel/:path*",
    "/account/:path*",
    "/updates/:path*",
    "/driver/:path*",
    "/conductor/:path*",
    "/ops/:path*",
    "/gov/:path*",
    "/admin/:path*",
  ],
};
