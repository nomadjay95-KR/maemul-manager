import { cn } from "@/lib/utils";
import type { ScheduleCategory } from "@/types/schedule";

const CATEGORY_STYLES: Record<ScheduleCategory, string> = {
  contract: "bg-blue-100 text-blue-700",
  move_in: "bg-green-100 text-green-700",
  balance: "bg-red-100 text-red-700",
  interim: "bg-orange-100 text-orange-700",
  etc: "bg-gray-100 text-gray-600",
};

export const CATEGORY_LABELS: Record<ScheduleCategory, string> = {
  contract: "계약서",
  move_in: "입주",
  balance: "잔금",
  interim: "중도금",
  etc: "기타",
};

const CATEGORY_DOT_COLORS: Record<ScheduleCategory, string> = {
  contract: "bg-blue-500",
  move_in: "bg-green-500",
  balance: "bg-red-500",
  interim: "bg-orange-500",
  etc: "bg-gray-400",
};

export function ScheduleBadge({ category }: { category: ScheduleCategory }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-md text-[13px] font-semibold whitespace-nowrap",
        CATEGORY_STYLES[category]
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

export function CategoryDot({ category }: { category: ScheduleCategory }) {
  return (
    <span
      className={cn("inline-block w-[6px] h-[6px] rounded-full", CATEGORY_DOT_COLORS[category])}
    />
  );
}
