import { auth } from "@/auth";
import { NextResponse } from "next/server";

// auth() wraps our proxy function and attaches req.auth (the session)
// from the JWT cookie — no network calls involved
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/inbox") || pathname.startsWith("/compose");

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/inbox/:path*", "/compose/:path*"],
};
