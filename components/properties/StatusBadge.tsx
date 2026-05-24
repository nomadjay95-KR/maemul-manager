import { cn } from "@/lib/utils";
import type { PropertyType, PropertyStatus } from "@/types/property";

const TYPE_CONFIG = {
  villa: { label: "빌라", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  shop: { label: "상가", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
} as const;

const STATUS_CONFIG = {
  active: { label: "가능", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  reserved: { label: "계약중", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  completed: { label: "완료", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
} as const;

export function TypeBadge({ type }: { type: PropertyType }) {
  const config = TYPE_CONFIG[type];
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
