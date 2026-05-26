"use client";

import Image from "next/image";
import type { PublicProperty } from "@/types/sharedLink";
import { formatPrice, getPriceText, DEAL_LABEL } from "@/lib/format/property";
import type { Property } from "@/types/property";
import AddressMap from "@/components/properties/AddressMap";
import InfoRow from "@/components/ui/InfoRow";

export default function PublicPropertyView({
  property,
}: {
  property: PublicProperty;
}) {
  const p = property;

  return (
    <div className="flex flex-col gap-6">
      {/* 사진 갤러리 */}
      {p.images.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {p.images.map((img) => (
            <div
              key={img.id}
              className="relative w-60 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100"
            >
              <Image
                src={img.image_url}
                alt={p.address}
                fill
                className="object-cover"
                sizes="240px"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-xl bg-gray-100 text-muted-foreground text-base">
          등록된 사진이 없습니다
        </div>
      )}

      {/* 배지 + 주소 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TypeBadge type={p.type} />
        </div>
        <h2 className="text-xl font-bold text-foreground">{p.address}</h2>
        <div className="mt-3">
          <AddressMap address={p.address} />
        </div>
      </div>

      {/* 가격 */}
      <div className="rounded-xl bg-gray-50 p-5">
        <p className="text-sm text-muted-foreground mb-1">
          {DEAL_LABEL[p.deal_type]}
        </p>
        <p className="text-2xl font-bold text-primary">
          {getPriceText(p as unknown as Property)}
        </p>
        {p.deal_type === "monthly" && (
          <p className="text-sm text-muted-foreground mt-1">
            보증금 {formatPrice(p.deposit)} / 월세{" "}
            {formatPrice(p.monthly_rent)}
          </p>
        )}
      </div>

      {/* 기본 정보 */}
      <section>
        <h3 className="text-[17px] font-bold text-muted-foreground mb-3">
          기본 정보
        </h3>
        <div className="rounded-xl border border-border p-4">
          <InfoRow
            label="입주 상태"
            value={p.occupancy_status === "vacant" ? "공실" : "입주중"}
          />
          <InfoRow label="이사 예정월" value={p.move_out_month} />
        </div>
      </section>

      {/* 빌라 전용 */}
      {p.type === "villa" && (
        <section>
          <h3 className="text-[17px] font-bold text-muted-foreground mb-3">
            빌라 정보
          </h3>
          <div className="rounded-xl border border-border p-4">
            <InfoRow label="호수" value={p.unit_number} />
            <InfoRow
              label="방 개수"
              value={p.rooms != null ? `${p.rooms}개` : null}
            />
            <InfoRow label="채광" value={p.lighting} />
            <InfoRow label="수리 상태" value={p.repair_status} />
            <InfoRow
              label="연식"
              value={p.building_age != null ? `${p.building_age}년` : null}
            />
            <InfoRow
              label="대출 가능"
              value={
                p.loan_available != null
                  ? p.loan_available
                    ? "가능"
                    : "불가"
                  : null
              }
            />
          </div>
        </section>
      )}

      {/* 상가 전용 */}
      {p.type === "shop" && (
        <section>
          <h3 className="text-[17px] font-bold text-muted-foreground mb-3">
            상가 정보
          </h3>
          <div className="rounded-xl border border-border p-4">
            <InfoRow label="층수" value={p.floor} />
            <InfoRow
              label="면적"
              value={p.area != null ? `${p.area}m²` : null}
            />
            <InfoRow
              label="권리금"
              value={p.premium != null ? formatPrice(p.premium) : null}
            />
            <InfoRow label="업종 제한" value={p.business_restriction} />
          </div>
        </section>
      )}

      {/* 특이사항 */}
      {p.notes && (
        <section>
          <h3 className="text-[17px] font-bold text-muted-foreground mb-3">
            특이사항
          </h3>
          <div className="rounded-xl border border-border p-4">
            <p className="text-base text-foreground whitespace-pre-wrap">
              {p.notes}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: "villa" | "shop" }) {
  const config = {
    villa: { label: "빌라", className: "bg-blue-100 text-blue-700" },
    shop: { label: "상가", className: "bg-orange-100 text-orange-700" },
  } as const;
  const c = config[type];
  return (
    <span
      className={`h-7 inline-flex items-center px-2.5 rounded text-[13px] font-semibold ${c.className}`}
    >
      {c.label}
    </span>
  );
}
