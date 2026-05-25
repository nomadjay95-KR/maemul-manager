import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { scheduleSchema } from "@/lib/validations/schedule";
import { cleanData } from "@/lib/utils";

export async function createSchedule(
  data: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { data: schedule, error } = await supabase
    .from("schedules")
    .insert(cleaned)
    .select("id")
    .single();

  if (error || !schedule) {
    console.error("Failed to insert schedule:", error?.message);
    return { error: "일정 등록에 실패했습니다." };
  }

  revalidatePath("/main");

  return { id: schedule.id };
}

export async function updateSchedule(
  id: string,
  data: Record<string, unknown>
): Promise<{ id: string } | { error: string }> {
  const supabase = getSupabase();

  const parsed = scheduleSchema.safeParse(data);
  if (!parsed.success) {
    return { error: JSON.stringify(parsed.error.flatten().fieldErrors) };
  }

  const cleaned = cleanData(parsed.data);

  const { error } = await supabase
    .from("schedules")
    .update(cleaned)
    .eq("id", id);

  if (error) {
    console.error("Failed to update schedule:", error.message);
    return { error: "일정 수정에 실패했습니다." };
  }

  revalidatePath("/main");

  return { id };
}

export async function deleteSchedule(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = getSupabase();

  const { error } = await supabase.from("schedules").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete schedule:", error.message);
    return { error: "일정 삭제에 실패했습니다." };
  }

  revalidatePath("/main");

  return { success: true };
}
