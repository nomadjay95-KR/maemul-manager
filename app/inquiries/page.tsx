import { Suspense } from "react";
import Link from "next/link";
import { fetchInquiries } from "@/lib/queries/inquiries";
import type { InquiryStatus } from "@/types/property";
import InquiryFilter from "@/components/inquiries/InquiryFilter";
import InquiryCard from "@/components/inquiries/InquiryCard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function InquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as InquiryStatus) || undefined;

  const inquiries = await fetchInquiries({ status });

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/main"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 매물
          </Link>
          <h1 className="text-xl font-bold text-foreground">문의 관리</h1>
        </div>
        <Link
          href="/inquiries/new"
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          + 등록
        </Link>
      </div>

      {/* 필터 */}
      <Suspense fallback={null}>
        <InquiryFilter />
      </Suspense>

      {/* 문의 리스트 */}
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
    </main>
  );
}
