import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { inquirySchema } from "@/lib/validations/inquiry";
import type { InquiryStatus } from "@/types/property";

function cleanData(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
  );
}

export async function createInquiry(
  data: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = inquirySchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .insert(cleaned)
    .select("id")
    .single();

  if (error || !inquiry) {
    console.error("Failed to insert inquiry:", error?.message);
    return { error: "문의 등록에 실패했습니다." };
  }

  revalidatePath("/inquiries");

  return { id: inquiry.id };
}

export async function updateInquiry(
  id: string,
  data: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = inquirySchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { error } = await supabase
    .from("inquiries")
    .update(cleaned)
    .eq("id", id);

  if (error) {
    console.error("Failed to update inquiry:", error.message);
    return { error: "문의 수정에 실패했습니다." };
  }

  revalidatePath("/inquiries");
  revalidatePath(`/inquiries/${id}`);

  return { id };
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update inquiry status:", error.message);
    return false;
  }

  revalidatePath("/inquiries");
  revalidatePath(`/inquiries/${id}`);

  return true;
}

export async function deleteInquiry(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  const { error } = await supabase.from("inquiries").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete inquiry:", error.message);
    return { error: "문의 삭제에 실패했습니다." };
  }

  revalidatePath("/inquiries");

  return { success: true };
}
