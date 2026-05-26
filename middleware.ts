import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth_user");
  const pathname = request.nextUrl.pathname;

  // 인증되지 않은 경우 → /lock
  if (!authCookie?.value) {
    return NextResponse.redirect(new URL("/lock", request.url));
  }

  // 사용자 관리 탭: admin만 접근
  if (pathname === "/main") {
    const tab = request.nextUrl.searchParams.get("tab");
    if (tab === "users") {
      try {
        const user = JSON.parse(authCookie.value);
        if (user.role !== "admin") {
          return NextResponse.redirect(new URL("/main", request.url));
        }
      } catch {
        return NextResponse.redirect(new URL("/lock", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher:
    "/((?!landing|lock|signup|share|api|_next/static|_next/image|favicon.ico|sw\\.js|workbox-.*\\.js|manifest\\.json|icons/.*).*)",
};
