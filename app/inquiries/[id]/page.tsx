import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchInquiryById, fetchMatchingProperties } from "@/lib/queries/inquiries";
import { DEAL_LABEL, formatPrice } from "@/lib/format/property";
import InquiryStatusChanger from "@/components/inquiries/InquiryStatusChanger";
import DeleteInquiryButton from "@/components/inquiries/DeleteInquiryButton";
import PropertyCard from "@/components/properties/PropertyCard";
import InfoRow from "@/components/ui/InfoRow";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const inquiry = await fetchInquiryById(id);

  if (!inquiry) {
    notFound();
  }

  const matchingProperties = await fetchMatchingProperties(inquiry);

  // 희망 조건 요약
  const conditions: string[] = [];
  if (inquiry.desired_deal_type) {
    conditions.push(DEAL_LABEL[inquiry.desired_deal_type]);
  }
  if (inquiry.desired_deposit_min != null || inquiry.desired_deposit_max != null) {
    const min = inquiry.desired_deposit_min != null ? formatPrice(inquiry.desired_deposit_min) : "-";
    const max = inquiry.desired_deposit_max != null ? formatPrice(inquiry.desired_deposit_max) : "-";
    conditions.push(`보증금 ${min} ~ ${max}`);
  }
  if (inquiry.desired_rent_max != null) {
    conditions.push(`월세 ~${formatPrice(inquiry.desired_rent_max)}`);
  }
  if (inquiry.desired_rooms != null) {
    conditions.push(`${inquiry.desired_rooms}방 이상`);
  }

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main?tab=inquiries"
          className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 문의 목록
        </Link>
        <div className="flex gap-3">
          <Link
            href={`/inquiries/${inquiry.id}/edit`}
            className="h-12 px-4 inline-flex items-center rounded-lg text-[15px] font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
          >
            수정
          </Link>
          <DeleteInquiryButton inquiryId={inquiry.id} />
        </div>
      </div>

      {/* 상태 변경 */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">상태 변경</p>
        <InquiryStatusChanger
          inquiryId={inquiry.id}
          currentStatus={inquiry.status}
        />
      </div>

      {/* 기본 정보 */}
      <div className="rounded-xl border border-border bg-white p-5 mb-4">
        <h2 className="text-[17px] font-bold text-muted-foreground mb-3">기본 정보</h2>
        <InfoRow label="이름" value={inquiry.name} />
        <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
          <span className="text-sm text-muted-foreground">연락처</span>
          <a
            href={`tel:${inquiry.phone}`}
            className="h-[52px] px-5 inline-flex items-center gap-2 rounded-xl bg-primary text-white text-base font-bold hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {inquiry.phone}
          </a>
        </div>
        <InfoRow label="문의일" value={inquiry.inquiry_date} />
      </div>

      {/* 희망 조건 */}
      {conditions.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-5 mb-4">
          <h2 className="text-[17px] font-bold text-muted-foreground mb-3">희망 조건</h2>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c, i) => (
              <span
                key={i}
                className="h-8 inline-flex items-center px-3 rounded-full text-sm bg-gray-100 text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 문의 내용 */}
      {inquiry.request_details && (
        <div className="rounded-xl border border-border bg-white p-5 mb-4">
          <h2 className="text-[17px] font-bold text-muted-foreground mb-2">문의 내용</h2>
          <p className="text-base text-foreground whitespace-pre-wrap">{inquiry.request_details}</p>
        </div>
      )}

      {/* 응대 결과 */}
      {inquiry.response_result && (
        <div className="rounded-xl border border-border bg-white p-5 mb-4">
          <h2 className="text-[17px] font-bold text-muted-foreground mb-2">응대 결과</h2>
          <p className="text-base text-foreground whitespace-pre-wrap">{inquiry.response_result}</p>
        </div>
      )}

      {/* 매칭 매물 */}
      <div className="mt-6">
        <h2 className="text-[17px] font-bold text-foreground mb-3">
          매칭 매물 ({matchingProperties.length}건)
        </h2>
        {matchingProperties.length === 0 ? (
          <p className="text-base text-muted-foreground py-4 text-center">
            조건에 맞는 매물이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {matchingProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
