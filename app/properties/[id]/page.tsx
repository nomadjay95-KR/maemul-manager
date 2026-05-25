import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPropertyById } from "@/lib/queries/properties";
import PropertyDetail from "@/components/properties/PropertyDetail";
import StatusChanger from "@/components/properties/StatusChanger";
import DeleteButton from "@/components/properties/DeleteButton";

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
    </main>
  );
}
