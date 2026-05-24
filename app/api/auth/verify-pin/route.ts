import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { pin } = await request.json();
  const correctPin = process.env.APP_PIN;

  if (!correctPin) {
    return NextResponse.json(
      { error: "PIN이 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  if (pin !== correctPin) {
    return NextResponse.json(
      { error: "잘못된 비밀번호입니다." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  // 세션 쿠키 (expires 미설정 = 브라우저 종료 시 삭제)
  response.cookies.set("app_unlocked", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
