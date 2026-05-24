import Link from "next/link";
import type { Property } from "@/types/property";
import { TypeBadge, StatusBadge } from "./StatusBadge";
import { getPriceText, DEAL_LABEL } from "@/lib/format/property";

export default function PropertyCard({ property }: { property: Property }) {
  const p = property;

  return (
    <Link
      href={`/properties/${p.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50 active:bg-accent"
    >
      {/* 상단: 배지 */}
      <div className="flex items-center gap-2 mb-2">
        <TypeBadge type={p.type} />
        <StatusBadge status={p.status} />
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
