import Link from "next/link";
import PropertyForm from "@/components/forms/PropertyForm";
import { fetchPropertyById } from "@/lib/queries/properties";
import type { PropertyWithImages } from "@/types/property";

interface PageProps {
  searchParams: Promise<{ copyFrom?: string }>;
}

export default async function NewPropertyPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let copySource: PropertyWithImages | null = null;
  if (params.copyFrom) {
    copySource = await fetchPropertyById(params.copyFrom);
  }

  // 복사 시: 사진 제외, 상태 active로 초기화
  const initialData = copySource
    ? { ...copySource, status: "active" as const, images: [] }
    : undefined;

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main"
          className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 목록
        </Link>
        <h1 className="text-xl font-bold text-foreground">
          {copySource ? "매물 복사 등록" : "매물 등록"}
        </h1>
        <div className="w-10" />
      </div>

      <PropertyForm initialData={initialData} />
    </main>
  );
}
