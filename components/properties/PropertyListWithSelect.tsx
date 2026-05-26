"use client";

import { useState } from "react";
import type { Property } from "@/types/property";
import { TypeBadge, StatusBadge } from "./StatusBadge";
import { getPriceText, DEAL_LABEL } from "@/lib/format/property";
import PropertyCard from "./PropertyCard";
import CreateShareLinkButton from "@/components/share/CreateShareLinkButton";
import { cn } from "@/lib/utils";

export default function PropertyListWithSelect({
  properties,
}: {
  properties: Property[];
}) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map((p) => p.id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  return (
    <>
      {/* 선택 모드 토글 */}
      {properties.length > 0 && (
        <div className="flex items-center justify-end mb-2">
          {selectMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAll}
                className="text-sm font-medium text-primary hover:underline"
              >
                {selectedIds.size === properties.length ? "전체 해제" : "전체 선택"}
              </button>
              <button
                onClick={exitSelectMode}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelectMode(true)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              선택 공유
            </button>
          )}
        </div>
      )}

      {/* 매물 목록 */}
      <div className="flex flex-col gap-3">
        {properties.map((property) =>
          selectMode ? (
            <button
              key={property.id}
              type="button"
              onClick={() => toggleSelect(property.id)}
              className={cn(
                "text-left rounded-xl border bg-white p-5 transition-colors",
                selectedIds.has(property.id)
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:bg-gray-50"
              )}
            >
              <SelectablePropertyContent
                property={property}
                selected={selectedIds.has(property.id)}
              />
            </button>
          ) : (
            <PropertyCard key={property.id} property={property} />
          )
        )}
      </div>

      {/* 선택 공유 하단 바 */}
      {selectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-40 flex justify-center">
          <div className="w-full max-w-[400px]">
            <CreateShareLinkButton
              propertyIds={Array.from(selectedIds)}
              label={`선택 매물 ${selectedIds.size}건 공유`}
            />
          </div>
        </div>
      )}
    </>
  );
}

function SelectablePropertyContent({
  property,
  selected,
}: {
  property: Property;
  selected: boolean;
}) {
  const p = property;

  return (
    <div className="flex items-start gap-3">
      {/* 체크박스 */}
      <div
        className={cn(
          "mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
          selected
            ? "bg-primary border-primary"
            : "border-gray-300 bg-white"
        )}
      >
        {selected && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <TypeBadge type={p.type} />
          <StatusBadge status={p.status} />
        </div>
        <p className="text-lg font-bold text-foreground truncate">
          {p.address}
        </p>
        <p className="text-xl font-bold text-primary mt-1">
          <span className="text-base font-normal text-gray-600 mr-1">
            {DEAL_LABEL[p.deal_type]}
          </span>
          {getPriceText(p)}
        </p>
      </div>
    </div>
  );
}
