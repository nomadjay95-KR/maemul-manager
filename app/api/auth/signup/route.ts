import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { signupSchema } from "@/lib/validations/user";

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0] || "입력을 확인해주세요.";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const supabase = getSupabase();

  // 첫 사용자 = admin
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const role = (count ?? 0) === 0 ? "admin" : "member";

  const { data: user, error } = await supabase
    .from("users")
    .insert({ name: parsed.data.name, pin: parsed.data.pin, role })
    .select("id, name, role")
    .single();

  if (error || !user) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "이미 사용 중인 이름입니다." },
        { status: 409 }
      );
    }
    console.error("Failed to create user:", error?.message);
    return NextResponse.json(
      { error: "등록에 실패했습니다." },
      { status: 500 }
    );
  }

  // 자동 로그인: 쿠키 설정
  const cookieValue = JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  const response = NextResponse.json({ success: true, user });

  response.cookies.set("auth_user", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
