"use client";

import { useState, useMemo } from "react";
import type { Schedule, ScheduleCategory } from "@/types/schedule";
import { CategoryDot } from "./ScheduleBadge";
import DaySchedules from "./DaySchedules";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  year: number;
  month: number;
  schedules: Schedule[];
}

export default function CalendarView({
  year,
  month,
  schedules,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 월 변경 시 서버에서 데이터를 다시 가져와야 하므로 URL 이동
  const handleMonthChange = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    // URL 변경으로 서버 리렌더링
    window.location.href = `/main?tab=calendar&year=${newYear}&month=${newMonth}`;
  };

  // 날짜별 일정 매핑
  const schedulesByDate = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    for (const s of schedules) {
      const key = s.schedule_date;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [schedules]);

  // 달력 그리드 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay(); // 0=일
    const totalDays = lastDay.getDate();

    const days: (number | null)[] = [];
    // 앞쪽 빈 칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    // 날짜 채우기
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  }, [year, month]);

  const today = new Date();
  const todayStr =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? String(today.getDate())
      : null;

  const selectedSchedules = selectedDate
    ? schedulesByDate[selectedDate] || []
    : [];

  return (
    <div>
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => handleMonthChange(-1)}
          className="h-10 w-10 rounded-lg text-lg font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center"
        >
          &lt;
        </button>
        <h2 className="text-lg font-bold text-foreground">
          {year}년 {month}월
        </h2>
        <button
          onClick={() => handleMonthChange(1)}
          className="h-10 w-10 rounded-lg text-lg font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center"
        >
          &gt;
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
          <div
            key={day}
            className={cn(
              "text-center text-sm font-semibold py-2",
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-14" />;
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const daySchedules = schedulesByDate[dateStr] || [];
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === String(day);
          const dayOfWeek = (idx) % 7;

          // 종류별 고유 색상 점 (최대 3개)
          const uniqueCategories = Array.from(
            new Set(daySchedules.map((s) => s.category))
          ).slice(0, 3) as ScheduleCategory[];

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={cn(
                "h-14 flex flex-col items-center justify-center rounded-lg transition-colors relative",
                isSelected
                  ? "bg-primary text-white"
                  : isToday
                    ? "bg-primary/10"
                    : "hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "text-base font-medium",
                  isSelected
                    ? "text-white"
                    : dayOfWeek === 0
                      ? "text-red-500"
                      : dayOfWeek === 6
                        ? "text-blue-500"
                        : "text-foreground"
                )}
              >
                {day}
              </span>

              {/* 일정 점 표시 */}
              {uniqueCategories.length > 0 && (
                <div className="flex gap-[3px] mt-0.5">
                  {uniqueCategories.map((cat) => (
                    <CategoryDot key={cat} category={cat} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜 일정 목록 */}
      {selectedDate && (
        <DaySchedules date={selectedDate} schedules={selectedSchedules} />
      )}
    </div>
  );
}
