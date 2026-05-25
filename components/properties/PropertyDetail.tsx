import Image from "next/image";
import type { PropertyWithImages } from "@/types/property";
import { TypeBadge, StatusBadge } from "./StatusBadge";
import { formatPrice, getPriceText, DEAL_LABEL } from "@/lib/format/property";
import AddressMap from "./AddressMap";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-base font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function PropertyDetail({ property }: { property: PropertyWithImages }) {
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
          <StatusBadge status={p.status} />
        </div>
        <h2 className="text-xl font-bold text-foreground">{p.address}</h2>
        <div className="mt-3">
          <AddressMap address={p.address} />
        </div>
      </div>

      {/* 가격 */}
      <div className="rounded-xl bg-gray-50 p-5">
        <p className="text-sm text-muted-foreground mb-1">{DEAL_LABEL[p.deal_type]}</p>
        <p className="text-2xl font-bold text-primary">{getPriceText(p)}</p>
        {p.deal_type === "monthly" && (
          <p className="text-sm text-muted-foreground mt-1">
            보증금 {formatPrice(p.deposit)} / 월세 {formatPrice(p.monthly_rent)}
          </p>
        )}
      </div>

      {/* 기본 정보 */}
      <section>
        <h3 className="text-[17px] font-bold text-muted-foreground mb-3">기본 정보</h3>
        <div className="rounded-xl border border-border p-4">
          <InfoRow label="입주 상태" value={p.occupancy_status === "vacant" ? "공실" : "입주중"} />
          <InfoRow label="이사 예정월" value={p.move_out_month} />
        </div>
      </section>

      {/* 빌라 전용 */}
      {p.type === "villa" && (
        <section>
          <h3 className="text-[17px] font-bold text-muted-foreground mb-3">빌라 정보</h3>
          <div className="rounded-xl border border-border p-4">
            <InfoRow label="호수" value={p.unit_number} />
            <InfoRow label="방 개수" value={p.rooms != null ? `${p.rooms}개` : null} />
            <InfoRow label="채광" value={p.lighting} />
            <InfoRow label="수리 상태" value={p.repair_status} />
            <InfoRow label="연식" value={p.building_age != null ? `${p.building_age}년` : null} />
            <InfoRow label="대출 가능" value={p.loan_available != null ? (p.loan_available ? "가능" : "불가") : null} />
          </div>
        </section>
      )}

      {/* 상가 전용 */}
      {p.type === "shop" && (
        <section>
          <h3 className="text-[17px] font-bold text-muted-foreground mb-3">상가 정보</h3>
          <div className="rounded-xl border border-border p-4">
            <InfoRow label="층수" value={p.floor} />
            <InfoRow label="면적" value={p.area != null ? `${p.area}m²` : null} />
            <InfoRow label="권리금" value={p.premium != null ? formatPrice(p.premium) : null} />
            <InfoRow label="업종 제한" value={p.business_restriction} />
          </div>
        </section>
      )}

      {/* 연락처 */}
      {(p.owner_phone || p.owner_personality || p.door_password) && (
        <section>
          <h3 className="text-[17px] font-bold text-muted-foreground mb-3">연락처 / 보안</h3>
          <div className="rounded-xl border border-border p-4">
            <InfoRow label="집주인 전화" value={p.owner_phone} />
            <InfoRow label="임대인 성향" value={p.owner_personality} />
            <InfoRow label="비밀번호" value={p.door_password} />
          </div>
        </section>
      )}

      {/* 기타 */}
      {(p.notes || p.memo) && (
        <section>
          <h3 className="text-[17px] font-bold text-muted-foreground mb-3">기타</h3>
          <div className="rounded-xl border border-border p-4">
            <InfoRow label="특이사항" value={p.notes} />
            <InfoRow label="메모" value={p.memo} />
          </div>
        </section>
      )}
    </div>
  );
}
