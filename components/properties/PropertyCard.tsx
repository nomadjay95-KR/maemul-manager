import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

const TYPE_LABEL = { villa: "빌라", shop: "상가" } as const;
const STATUS_LABEL = {
  active: "가능",
  reserved: "계약중",
  completed: "완료",
} as const;
const DEAL_LABEL = {
  monthly: "월세",
  jeonse: "전세",
  sale: "매매",
} as const;

function formatPrice(value: number | null): string {
  if (value == null) return "-";
  if (value >= 10000) return `${(value / 10000).toFixed(value % 10000 === 0 ? 0 : 1)}억`;
  return `${value.toLocaleString()}만`;
}

function getPriceText(p: Property): string {
  switch (p.deal_type) {
    case "monthly":
      return `${formatPrice(p.deposit)} / ${formatPrice(p.monthly_rent)}`;
    case "jeonse":
      return formatPrice(p.jeonse_price);
    case "sale":
      return formatPrice(p.sale_price);
  }
}

export default function PropertyCard({ property }: { property: Property }) {
  const p = property;

  return (
    <Link
      href={`/properties/${p.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50 active:bg-accent"
    >
      {/* 상단: 배지 */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            p.type === "villa"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
          )}
        >
          {TYPE_LABEL[p.type]}
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            p.status === "active" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
            p.status === "reserved" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
            p.status === "completed" && "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          {STATUS_LABEL[p.status]}
        </span>
      </div>

      {/* 주소 */}
      <p className="text-sm font-semibold text-foreground truncate">{p.address}</p>

      {/* 가격 */}
      <p className="text-lg font-bold text-foreground mt-1">
        <span className="text-xs font-normal text-muted-foreground mr-1">
          {DEAL_LABEL[p.deal_type]}
        </span>
        {getPriceText(p)}
      </p>

      {/* 세부 정보 */}
      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
        {p.type === "villa" ? (
          <>
            {p.rooms != null && <span>방 {p.rooms}개</span>}
            {p.unit_number && <span>{p.unit_number}</span>}
          </>
        ) : (
          <>
            {p.floor && <span>{p.floor}</span>}
            {p.area != null && <span>{p.area}m²</span>}
          </>
        )}
        {p.occupancy_status === "vacant" ? (
          <span className="text-green-600 dark:text-green-400">공실</span>
        ) : (
          <span className="text-muted-foreground">입주중</span>
        )}
      </div>
    </Link>
  );
}
