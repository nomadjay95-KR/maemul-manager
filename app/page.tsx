import { Suspense } from "react";
import Link from "next/link";
import { fetchProperties } from "@/lib/queries/properties";

export const dynamic = "force-dynamic";
import type { PropertyStatus, PropertyType } from "@/types/property";
import PropertyFilter from "@/components/properties/PropertyFilter";
import PropertyCard from "@/components/properties/PropertyCard";
import LockButton from "@/components/properties/LockButton";

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as PropertyStatus) || undefined;
  const type = (params.type as PropertyType) || undefined;

  const properties = await fetchProperties({ status, type });

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">매물 목록</h1>
        <div className="flex gap-2">
          <Link
            href="/properties/new"
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            + 등록
          </Link>
          <LockButton />
        </div>
      </div>

      {/* 필터 */}
      <Suspense fallback={null}>
        <PropertyFilter />
      </Suspense>

      {/* 매물 리스트 */}
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
    </main>
  );
}
