import Image from "next/image";
import type { PublicProperty } from "@/types/sharedLink";
import { getPriceText, DEAL_LABEL } from "@/lib/format/property";
import type { Property } from "@/types/property";

export default function PublicPropertyCard({
  property,
  onClick,
}: {
  property: PublicProperty;
  onClick?: () => void;
}) {
  const p = property;
  const firstImage = p.images[0];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border bg-white overflow-hidden transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      {/* 썸네일 */}
      {firstImage ? (
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={firstImage.image_url}
            alt={p.address}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 bg-gray-100 text-muted-foreground text-sm">
          사진 없음
        </div>
      )}

      <div className="p-5">
        {/* 배지 */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`h-7 inline-flex items-center px-2.5 rounded text-[13px] font-semibold ${
              p.type === "villa"
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {p.type === "villa" ? "빌라" : "상가"}
          </span>
        </div>

        {/* 주소 */}
        <p className="text-lg font-bold text-foreground truncate">
          {p.address}
        </p>

        {/* 가격 */}
        <p className="text-xl font-bold text-primary mt-1">
          <span className="text-base font-normal text-gray-600 mr-1">
            {DEAL_LABEL[p.deal_type]}
          </span>
          {getPriceText(p as unknown as Property)}
        </p>

        {/* 세부 정보 */}
        <div className="flex gap-3 mt-3 text-base text-gray-600">
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
      </div>
    </button>
  );
}
