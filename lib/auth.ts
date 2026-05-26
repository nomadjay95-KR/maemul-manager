import { cookies } from "next/headers";

export interface AuthUser {
  id: string;
  name: string;
  role: "admin" | "member";
}

/** 서버 컴포넌트/액션에서 현재 로그인 사용자 읽기 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("auth_user");
  if (!cookie?.value) return null;

  try {
    const parsed = JSON.parse(cookie.value);
    if (parsed.id && parsed.name && parsed.role) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}
