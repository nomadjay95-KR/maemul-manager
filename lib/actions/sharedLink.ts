import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(16).toString("base64url");
}

export async function createSharedLink(
  propertyIds: string[]
): Promise<{ token: string } | { error: string }> {
  if (propertyIds.length === 0) {
    return { error: "매물을 선택해주세요." };
  }

  const supabase = getSupabase();
  const token = generateToken();

  const { error } = await supabase.from("shared_links").insert({
    token,
    property_ids: propertyIds,
  });

  if (error) {
    console.error("Failed to create shared link:", error.message);
    return { error: "공유 링크 생성에 실패했습니다." };
  }

  revalidatePath("/main");
  return { token };
}

export async function deactivateSharedLink(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("shared_links")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Failed to deactivate shared link:", error.message);
    return { error: "링크 비활성화에 실패했습니다." };
  }

  revalidatePath("/shared-links");
  return { success: true };
}

export async function activateSharedLink(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("shared_links")
    .update({ is_active: true })
    .eq("id", id);

  if (error) {
    console.error("Failed to activate shared link:", error.message);
    return { error: "링크 활성화에 실패했습니다." };
  }

  revalidatePath("/shared-links");
  return { success: true };
}

export async function deleteSharedLink(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("shared_links")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete shared link:", error.message);
    return { error: "링크 삭제에 실패했습니다." };
  }

  revalidatePath("/shared-links");
  return { success: true };
}
