import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/dashboard")) {
    const access = req.cookies.get("accessToken")?.value || undefined;
    if (!access) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|fonts|images).*)"],
};
