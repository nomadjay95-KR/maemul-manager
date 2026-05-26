"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { resetPinSchema } from "@/lib/validations/user";

export async function deleteUser(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  // 마지막 admin 삭제 방지
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", id)
    .single();

  if (user?.role === "admin") {
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) <= 1) {
      return { error: "마지막 관리자는 삭제할 수 없습니다." };
    }
  }

  const { error } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete user:", error.message);
    return { error: "사용자 삭제에 실패했습니다." };
  }

  revalidatePath("/main");
  revalidatePath("/lock");
  return { success: true };
}

export async function changeUserRole(
  id: string,
  role: "admin" | "member"
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  // admin → member 변경 시: 마지막 admin 강등 방지
  if (role === "member") {
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if ((count ?? 0) <= 1) {
      return { error: "마지막 관리자의 권한을 변경할 수 없습니다." };
    }
  }

  const { error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", id);

  if (error) {
    console.error("Failed to change user role:", error.message);
    return { error: "역할 변경에 실패했습니다." };
  }

  revalidatePath("/main");
  return { success: true };
}

export async function resetUserPin(
  id: string,
  data: Record<string, unknown>
): Promise<{ success: true } | { error: string }> {
  const parsed = resetPinSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "PIN은 숫자 4자리만 가능합니다." };
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("users")
    .update({ pin: parsed.data.newPin })
    .eq("id", id);

  if (error) {
    console.error("Failed to reset PIN:", error.message);
    return { error: "PIN 변경에 실패했습니다." };
  }

  return { success: true };
}
