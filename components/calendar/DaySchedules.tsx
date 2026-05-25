"use client";

import Link from "next/link";
import type { Schedule } from "@/types/schedule";
import { ScheduleBadge } from "./ScheduleBadge";

interface DaySchedulesProps {
  date: string; // YYYY-MM-DD
  schedules: Schedule[];
}

export default function DaySchedules({ date, schedules }: DaySchedulesProps) {
  const formatted = formatDateLabel(date);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground">{formatted}</h3>
        <Link
          href={`/calendar/new?date=${date}`}
          className="h-10 px-4 rounded-lg text-[15px] font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center"
        >
          + 일정 추가
        </Link>
      </div>

      {schedules.length === 0 ? (
        <p className="text-base text-muted-foreground py-6 text-center">
          이 날의 일정이 없습니다
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {schedules.map((schedule) => (
            <Link
              key={schedule.id}
              href={`/calendar/${schedule.id}/edit`}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
            >
              {/* 시간 */}
              <span className="text-sm text-muted-foreground w-14 shrink-0 text-center">
                {schedule.schedule_time
                  ? schedule.schedule_time.slice(0, 5)
                  : "종일"}
              </span>

              {/* 제목 */}
              <span className="text-base font-medium text-foreground flex-1 truncate">
                {schedule.title}
              </span>

              {/* 배지 */}
              <ScheduleBadge category={schedule.category} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayName = dayNames[d.getDay()];
  return `${month}월 ${day}일 (${dayName})`;
}
