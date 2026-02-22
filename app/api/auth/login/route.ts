import { NextResponse } from "next/server";

import {
  createSignedSessionToken,
  getSessionCookieName,
  getSessionMaxAgeSeconds,
} from "@/lib/auth/session";

type LoginBody = {
  password?: string;
};

export async function POST(request: Request) {
  const sitePassword = process.env.SITE_PASSWORD;
  const signingKey = process.env.COOKIE_SIGNING_KEY;

  if (!sitePassword || !signingKey) {
    return NextResponse.json({ error: "Auth environment is not configured." }, { status: 500 });
  }

  const body = (await request.json().catch(() => null)) as LoginBody | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (password !== sitePassword) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const token = await createSignedSessionToken(signingKey);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  return response;
}
