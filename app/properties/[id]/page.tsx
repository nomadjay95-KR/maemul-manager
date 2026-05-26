import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPropertyById, fetchStatusHistory } from "@/lib/queries/properties";
import { fetchMatchingInquiries } from "@/lib/queries/inquiries";
import { fetchDocumentsByProperty } from "@/lib/queries/documents";
import { DEAL_LABEL, formatPrice } from "@/lib/format/property";
import PropertyDetail from "@/components/properties/PropertyDetail";
import StatusChanger from "@/components/properties/StatusChanger";
import DeleteButton from "@/components/properties/DeleteButton";
import ShareButtons from "@/components/properties/ShareButtons";
import CreateShareLinkButton from "@/components/share/CreateShareLinkButton";
import DocumentList from "@/components/documents/DocumentList";
import DocumentUpload from "@/components/documents/DocumentUpload";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params;
  const property = await fetchPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main"
          className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 목록
        </Link>
        <div className="flex gap-3">
          <Link
            href={`/properties/new?copyFrom=${property.id}`}
            className="h-12 px-4 inline-flex items-center rounded-lg text-[15px] font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
          >
            복사
          </Link>
          <Link
            href={`/properties/${property.id}/edit`}
            className="h-12 px-4 inline-flex items-center rounded-lg text-[15px] font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
          >
            수정
          </Link>
          <DeleteButton propertyId={property.id} />
        </div>
      </div>

      {/* 상태 변경 */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">상태 변경</p>
        <StatusChanger
          propertyId={property.id}
          currentStatus={property.status}
        />
      </div>

      {/* 상세 정보 */}
      <PropertyDetail property={property} />

      {/* 상태 변경 이력 */}
      <StatusHistorySection propertyId={property.id} />

      {/* 관심 가능 문의 */}
      <MatchingInquiriesSection property={property} />

      {/* 첨부 서류 */}
      <DocumentSection propertyId={property.id} />

      {/* 고객 공유 링크 */}
      <div className="mt-6">
        <p className="text-sm text-muted-foreground mb-2">고객 공유</p>
        <CreateShareLinkButton propertyIds={[property.id]} />
      </div>

      {/* 내부 공유 */}
      <div className="mt-6 mb-4">
        <p className="text-sm text-muted-foreground mb-2">내부 공유</p>
        <ShareButtons property={property} />
      </div>
    </main>
  );
}

const STATUS_LABEL: Record<string, string> = {
  active: "가능",
  reserved: "계약중",
  completed: "완료",
};

async function StatusHistorySection({ propertyId }: { propertyId: string }) {
  const history = await fetchStatusHistory(propertyId);

  if (history.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-[17px] font-bold text-muted-foreground mb-3">
        상태 변경 이력
      </h2>
      <div className="rounded-xl border border-border p-4 flex flex-col gap-2">
        {history.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
          >
            <span className="text-base text-foreground">
              {h.from_status ? STATUS_LABEL[h.from_status] ?? h.from_status : "신규"}{" "}
              → {STATUS_LABEL[h.to_status] ?? h.to_status}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(h.changed_at).toLocaleDateString("ko-KR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

async function MatchingInquiriesSection({
  property,
}: {
  property: import("@/types/property").PropertyWithImages;
}) {
  const inquiries = await fetchMatchingInquiries(property);

  return (
    <div className="mt-6">
      <h2 className="text-[17px] font-bold text-foreground mb-3">
        관심 가능 문의 ({inquiries.length}건)
      </h2>
      {inquiries.length === 0 ? (
        <p className="text-base text-muted-foreground py-4 text-center">
          조건에 맞는 문의가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((inq) => {
            const conditions: string[] = [];
            if (inq.desired_deal_type) conditions.push(DEAL_LABEL[inq.desired_deal_type]);
            if (inq.desired_deposit_max != null) conditions.push(`보증금 ~${formatPrice(inq.desired_deposit_max)}`);
            if (inq.desired_rent_max != null) conditions.push(`월세 ~${formatPrice(inq.desired_rent_max)}`);
            if (inq.desired_rooms != null) conditions.push(`${inq.desired_rooms}방+`);

            return (
              <Link
                key={inq.id}
                href={`/inquiries/${inq.id}`}
                className="rounded-xl border border-border p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold text-foreground">{inq.name}</span>
                  <span className="text-sm text-muted-foreground">{inq.phone}</span>
                </div>
                {conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {conditions.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

async function DocumentSection({ propertyId }: { propertyId: string }) {
  const documents = await fetchDocumentsByProperty(propertyId);

  return (
    <div className="mt-6">
      <h2 className="text-[17px] font-bold text-foreground mb-3">
        첨부 서류 ({documents.length}건)
      </h2>
      <DocumentList documents={documents} propertyId={propertyId} />
      <div className="mt-4">
        <DocumentUpload propertyId={propertyId} />
      </div>
    </div>
  );
}
