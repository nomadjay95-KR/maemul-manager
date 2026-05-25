import { getSupabase } from "@/lib/supabase";
import type { Schedule, ScheduleWithProperty } from "@/types/schedule";

export async function fetchSchedulesByMonth(
  year: number,
  month: number
): Promise<Schedule[]> {
  const supabase = getSupabase();

  // month는 1-12
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .gte("schedule_date", startDate)
    .lt("schedule_date", endDate)
    .order("schedule_date", { ascending: true })
    .order("schedule_time", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Failed to fetch schedules:", error.message);
    return [];
  }

  return data as Schedule[];
}

export async function fetchScheduleById(
  id: string
): Promise<ScheduleWithProperty | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("schedules")
    .select("*, property:properties(id, address, type)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch schedule:", error.message);
    return null;
  }

  return data as ScheduleWithProperty;
}
