import { getSupabase } from "@/lib/supabase";
import type { User, UserListItem, UserPublic } from "@/types/user";

/** 로그인 화면용: id, name만 */
export async function fetchUsers(): Promise<UserListItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch users:", error.message);
    return [];
  }
  return data ?? [];
}

/** 사용자 수 (0이면 가입 유도) */
export async function fetchUserCount(): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Failed to count users:", error.message);
    return 0;
  }
  return count ?? 0;
}

/** PIN 검증용: 전체 필드 */
export async function fetchUserById(id: string): Promise<User | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch user:", error.message);
    return null;
  }
  return data as User;
}

/** 관리 페이지용: PIN 제외 */
export async function fetchUsersForAdmin(): Promise<UserPublic[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch users for admin:", error.message);
    return [];
  }
  return data ?? [];
}
