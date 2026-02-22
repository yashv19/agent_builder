import { NextRequest, NextResponse } from "next/server";

import { getSessionCookieName, verifySignedSessionToken } from "@/lib/auth/session";

const AUTH_PATH = "/auth";
const AUTH_API_PREFIX = "/api/auth";

function isStaticPath(pathname: string) {
  return pathname.startsWith("/_next") || pathname === "/favicon.ico" || /\.[a-zA-Z0-9]+$/.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isStaticPath(pathname) || pathname.startsWith(AUTH_API_PREFIX)) {
    return NextResponse.next();
  }

  if (pathname === AUTH_PATH) {
    return NextResponse.next();
  }

  const signingKey = process.env.COOKIE_SIGNING_KEY;
  if (!signingKey) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Auth environment is not configured." }, { status: 500 });
    }

    const url = new URL(AUTH_PATH, request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const token = request.cookies.get(getSessionCookieName())?.value ?? "";
  const isAuthenticated = await verifySignedSessionToken(token, signingKey);

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authUrl = new URL(AUTH_PATH, request.url);
  authUrl.searchParams.set("next", pathname + search);

  return NextResponse.redirect(authUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
