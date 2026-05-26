import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { userId, pin } = await request.json();

  if (!userId || !pin) {
    return NextResponse.json(
      { error: "사용자와 PIN을 입력해주세요." },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, pin, role")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: "사용자를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (pin !== user.pin) {
    return NextResponse.json(
      { error: "PIN이 일치하지 않습니다." },
      { status: 401 }
    );
  }

  const cookieValue = JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, role: user.role },
  });

  response.cookies.set("auth_user", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
