import { Suspense } from "react";
import Link from "next/link";
import { fetchProperties } from "@/lib/queries/properties";
import { fetchInquiries } from "@/lib/queries/inquiries";
import type {
  PropertyStatus,
  PropertyType,
  InquiryStatus,
} from "@/types/property";
import PropertyFilter from "@/components/properties/PropertyFilter";
import PropertyCard from "@/components/properties/PropertyCard";
import InquiryFilter from "@/components/inquiries/InquiryFilter";
import InquiryCard from "@/components/inquiries/InquiryCard";
import LockButton from "@/components/properties/LockButton";
import TabNav from "@/components/layout/TabNav";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    status?: string;
    type?: string;
  }>;
}

export default async function MainPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = params.tab === "inquiries" ? "inquiries" : "properties";

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">
          {tab === "properties" ? "매물장" : "문의장"}
        </h1>
        <div className="flex gap-2">
          <Link
            href={tab === "properties" ? "/properties/new" : "/inquiries/new"}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            + 등록
          </Link>
          <LockButton />
        </div>
      </div>

      {/* 탭 */}
      <Suspense fallback={null}>
        <TabNav />
      </Suspense>

      {/* 탭 콘텐츠 */}
      {tab === "properties" ? (
        <PropertiesTab status={params.status} type={params.type} />
      ) : (
        <InquiriesTab status={params.status} />
      )}
    </main>
  );
}

async function PropertiesTab({
  status,
  type,
}: {
  status?: string;
  type?: string;
}) {
  const properties = await fetchProperties({
    status: (status as PropertyStatus) || undefined,
    type: (type as PropertyType) || undefined,
  });

  return (
    <>
      <Suspense fallback={null}>
        <PropertyFilter />
      </Suspense>
      <div className="mt-4 flex flex-col gap-3">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">매물이 없습니다</p>
            <p className="text-sm mt-1">새 매물을 등록해보세요.</p>
          </div>
        ) : (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>
    </>
  );
}

async function InquiriesTab({ status }: { status?: string }) {
  const inquiries = await fetchInquiries({
    status: (status as InquiryStatus) || undefined,
  });

  return (
    <>
      <Suspense fallback={null}>
        <InquiryFilter />
      </Suspense>
      <div className="mt-4 flex flex-col gap-3">
        {inquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">문의가 없습니다</p>
            <p className="text-sm mt-1">새 문의를 등록해보세요.</p>
          </div>
        ) : (
          inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} />
          ))
        )}
      </div>
    </>
  );
}
