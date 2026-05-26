import { getSupabase } from "@/lib/supabase";
import type { ScheduleCategory } from "@/types/schedule";

export interface UpcomingEvent {
  id: string;
  title: string;
  schedule_date: string;
  schedule_time: string | null;
  category: ScheduleCategory;
  property?: { id: string; address: string } | null;
}

/**
 * 오늘~7일 이내 다가오는 일정 조회 (모든 종류)
 */
export async function fetchUpcomingEvents(): Promise<UpcomingEvent[]> {
  const supabase = getSupabase();
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);

  const todayStr = today.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("schedules")
    .select(
      "id, title, schedule_date, schedule_time, category, property:properties(id, address)"
    )
    .gte("schedule_date", todayStr)
    .lte("schedule_date", endStr)
    .order("schedule_date", { ascending: true })
    .order("schedule_time", { ascending: true, nullsFirst: false });

  if (error || !data) return [];

  return data.map((d) => {
    const prop = Array.isArray(d.property) ? d.property[0] : d.property;
    return {
      id: d.id as string,
      title: d.title as string,
      schedule_date: d.schedule_date as string,
      schedule_time: d.schedule_time as string | null,
      category: d.category as ScheduleCategory,
      property: prop as UpcomingEvent["property"],
    };
  });
}
