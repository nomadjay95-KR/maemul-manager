import { cn } from "@/lib/utils";
import type { PropertyType, PropertyStatus } from "@/types/property";

const TYPE_CONFIG = {
  villa: { label: "빌라", className: "bg-blue-100 text-blue-700" },
  shop: { label: "상가", className: "bg-orange-100 text-orange-700" },
} as const;

const STATUS_CONFIG = {
  active: { label: "가능", className: "bg-green-100 text-green-700" },
  reserved: { label: "계약중", className: "bg-yellow-100 text-yellow-700" },
  completed: { label: "완료", className: "bg-gray-100 text-gray-500" },
} as const;

export function TypeBadge({ type }: { type: PropertyType }) {
  const config = TYPE_CONFIG[type];
  return (
    <span className={cn("h-7 inline-flex items-center px-2.5 rounded text-[13px] font-semibold", config.className)}>
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("h-7 inline-flex items-center px-2.5 rounded text-[13px] font-semibold", config.className)}>
      {config.label}
    </span>
  );
}
