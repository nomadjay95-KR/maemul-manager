import Link from "next/link";
import { cn } from "@/lib/utils";
import type { UpcomingEvent } from "@/lib/queries/notifications";
import { CATEGORY_LABELS } from "@/components/calendar/ScheduleBadge";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day}(${weekday})`;
}

function formatTime(time: string | null): string {
  if (!time) return "종일";
  return time.slice(0, 5);
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export default function NotificationBanner({
  events,
}: {
  events: UpcomingEvent[];
}) {
  if (events.length === 0) return null;

  const todayEvents = events.filter((e) => isToday(e.schedule_date));
  const weekEvents = events.filter((e) => !isToday(e.schedule_date));

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-2.5 bg-white border-b border-gray-200 flex items-center gap-2">
        <span className="text-lg">📅</span>
        <h2 className="text-base font-bold text-foreground">다가오는 일정</h2>
        <span className="text-sm text-muted-foreground ml-auto">
          {events.length}건
        </span>
      </div>

      {/* 오늘 일정 */}
      {todayEvents.length > 0 && (
        <div className="border-b border-red-100">
          <div className="px-4 py-1.5 bg-red-50">
            <span className="text-sm font-bold text-red-600">오늘</span>
          </div>
          {todayEvents.map((event) => (
            <EventRow key={event.id} event={event} highlight />
          ))}
        </div>
      )}

      {/* 이번 주 일정 */}
      {weekEvents.length > 0 && (
        <div>
          {todayEvents.length > 0 && (
            <div className="px-4 py-1.5 bg-gray-100">
              <span className="text-sm font-bold text-gray-500">이번 주</span>
            </div>
          )}
          {weekEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({
  event,
  highlight = false,
}: {
  event: UpcomingEvent;
  highlight?: boolean;
}) {
  const today = isToday(event.schedule_date);

  return (
    <Link
      href={`/calendar/${event.id}/edit`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 min-h-[52px] transition-colors",
        highlight
          ? "bg-red-50 hover:bg-red-100 border-l-4 border-red-500"
          : "bg-white hover:bg-gray-50 border-l-4 border-transparent"
      )}
    >
      {/* 날짜/시간 */}
      <div className="flex flex-col items-center min-w-[60px]">
        {!today && (
          <span className="text-sm font-semibold text-gray-700">
            {formatDate(event.schedule_date)}
          </span>
        )}
        <span
          className={cn(
            "text-sm",
            today ? "font-semibold text-red-600" : "text-gray-500"
          )}
        >
          {formatTime(event.schedule_time)}
        </span>
      </div>

      {/* 종류 배지 */}
      <span
        className={cn(
          "shrink-0 px-2 py-0.5 rounded-md text-[13px] font-semibold whitespace-nowrap",
          categoryStyle(event.category)
        )}
      >
        {CATEGORY_LABELS[event.category]}
      </span>

      {/* 제목 + 매물주소 */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-base font-medium truncate",
            highlight ? "text-red-900" : "text-foreground"
          )}
        >
          {event.title}
        </p>
        {event.property?.address && (
          <p className="text-sm text-muted-foreground truncate">
            {event.property.address}
          </p>
        )}
      </div>
    </Link>
  );
}

function categoryStyle(category: string): string {
  const styles: Record<string, string> = {
    contract: "bg-blue-100 text-blue-700",
    move_in: "bg-green-100 text-green-700",
    balance: "bg-red-100 text-red-700",
    interim: "bg-orange-100 text-orange-700",
    etc: "bg-gray-100 text-gray-600",
  };
  return styles[category] || styles.etc;
}
