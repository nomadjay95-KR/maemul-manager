"use client";

import { useState } from "react";
import type { PublicProperty } from "@/types/sharedLink";
import PublicPropertyView from "@/components/share/PublicPropertyView";
import PublicPropertyCard from "@/components/share/PublicPropertyCard";

export default function SharePageClient({
  properties,
}: {
  properties: PublicProperty[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    properties.length === 1 ? properties[0].id : null
  );

  const selectedProperty = selectedId
    ? properties.find((p) => p.id === selectedId) ?? null
    : null;

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 pt-6 pb-32 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        {selectedProperty && properties.length > 1 ? (
          <button
            onClick={() => setSelectedId(null)}
            className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 목록
          </button>
        ) : (
          <h1 className="text-xl font-bold text-foreground">
            {properties.length === 1 ? "매물 정보" : `매물 ${properties.length}건`}
          </h1>
        )}
      </div>

      {/* 콘텐츠 */}
      {selectedProperty ? (
        <PublicPropertyView property={selectedProperty} />
      ) : (
        <div className="flex flex-col gap-4">
          {properties.map((p) => (
            <PublicPropertyCard
              key={p.id}
              property={p}
              onClick={() => setSelectedId(p.id)}
            />
          ))}
        </div>
      )}

      {/* 중개사 정보 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-foreground">
              이필순 중개사
            </p>
            <p className="text-sm text-muted-foreground">하나부동산</p>
          </div>
          <a
            href="tel:010-6555-2806"
            className="h-[52px] px-6 inline-flex items-center gap-2 rounded-xl bg-primary text-white text-base font-bold hover:bg-primary/90 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            010-6555-2806
          </a>
        </div>
      </div>
    </main>
  );
}
