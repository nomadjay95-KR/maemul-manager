import Link from "next/link";
import type { Property } from "@/types/property";
import { TypeBadge, StatusBadge } from "./StatusBadge";
import { getPriceText, DEAL_LABEL } from "@/lib/format/property";

export default function PropertyCard({ property }: { property: Property }) {
  const p = property;

  return (
    <Link
      href={`/properties/${p.id}`}
      className="block rounded-xl border border-border bg-white p-5 transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      {/* 상단: 배지 */}
      <div className="flex items-center gap-2 mb-2">
        <TypeBadge type={p.type} />
        <StatusBadge status={p.status} />
      </div>

      {/* 주소 */}
      <p className="text-lg font-bold text-foreground truncate">{p.address}</p>

      {/* 가격 */}
      <p className="text-xl font-bold text-primary mt-1">
        <span className="text-sm font-normal text-muted-foreground mr-1">
          {DEAL_LABEL[p.deal_type]}
        </span>
        {getPriceText(p)}
      </p>

      {/* 세부 정보 */}
      <div className="flex gap-3 mt-3 text-sm text-muted-foreground">
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
          <span className="text-green-600">공실</span>
        ) : (
          <span>입주중</span>
        )}
      </div>
    </Link>
  );
}
