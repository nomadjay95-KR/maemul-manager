import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isUnlocked = request.cookies.get("app_unlocked");

  if (!isUnlocked) {
    return NextResponse.redirect(new URL("/lock", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!lock|api|_next/static|_next/image|favicon.ico).*)",
};
