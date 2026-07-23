import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDevelopmentEnvironment } from "./lib/constants";

export async function proxy(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const rawPathname = request.nextUrl.pathname;
  const pathname =
    base && rawPathname.startsWith(base)
      ? rawPathname.slice(base.length) || "/"
      : rawPathname;

  if (
    pathname.startsWith("/ping") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/llms.txt.hbs"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie:
      process.env.NEXTAUTH_URL?.startsWith("https://") ??
      !isDevelopmentEnvironment,
  });

  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL(`${base}/login`, request.url));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL(`${base}/`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
