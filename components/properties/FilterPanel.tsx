"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DEAL_TYPE_OPTIONS,
  DEPOSIT_OPTIONS,
  RENT_OPTIONS,
  ROOM_OPTIONS,
  OCCUPANCY_OPTIONS,
  AGE_OPTIONS,
  FLOOR_OPTIONS,
  FILTER_KEYS,
  type FilterKey,
} from "@/lib/constants/filterRanges";

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
}

const FILTER_GROUPS: {
  key: FilterKey;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  { key: "dealType", label: "거래유형", options: DEAL_TYPE_OPTIONS },
  { key: "deposit", label: "보증금", options: DEPOSIT_OPTIONS },
  { key: "rent", label: "월세", options: RENT_OPTIONS },
  { key: "rooms", label: "방 개수", options: ROOM_OPTIONS },
  { key: "occupancy", label: "입주상태", options: OCCUPANCY_OPTIONS },
  { key: "age", label: "연식", options: AGE_OPTIONS },
  { key: "floor", label: "층수", options: FLOOR_OPTIONS },
];

export default function FilterPanel({ open, onClose }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 내부 임시 필터 상태
  const [draft, setDraft] = useState<Record<FilterKey, string>>(() =>
    getInitial(searchParams)
  );

  // 패널 열릴 때 현재 URL 상태로 초기화
  useEffect(() => {
    if (open) {
      setDraft(getInitial(searchParams));
    }
  }, [open, searchParams]);

  const activeCount = FILTER_KEYS.filter((k) => draft[k] !== "").length;

  const handleSelect = (key: FilterKey, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const empty = {} as Record<FilterKey, string>;
    FILTER_KEYS.forEach((k) => (empty[k] = ""));
    setDraft(empty);
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    // 기존 필터 키 제거 후 다시 설정
    FILTER_KEYS.forEach((key) => {
      if (draft[key]) {
        params.set(key, draft[key]);
      } else {
        params.delete(key);
      }
    });
    params.set("tab", "properties");
    router.push(`/main?${params.toString()}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* 패널 */}
      <div className="relative w-full max-w-3xl bg-white rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">상세 필터</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 필터 그룹 */}
        <div className="px-5 py-4 overflow-y-auto max-h-[60vh] flex flex-col gap-5">
          {FILTER_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="text-base font-semibold text-foreground mb-2">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(group.key, opt.value)}
                    className={cn(
                      "h-[44px] px-4 rounded-xl text-[15px] font-medium transition-colors",
                      draft[group.key] === opt.value
                        ? "bg-primary text-white"
                        : "bg-white text-muted-foreground border border-border hover:bg-accent"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 px-5 py-4 border-t border-border">
          <button
            onClick={handleReset}
            className="flex-1 h-[52px] rounded-xl border border-border text-base font-bold text-muted-foreground hover:bg-accent transition-colors"
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] h-[52px] rounded-xl bg-primary text-white text-base font-bold hover:bg-primary/90 transition-colors"
          >
            적용{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitial(
  searchParams: ReturnType<typeof useSearchParams>
): Record<FilterKey, string> {
  const init = {} as Record<FilterKey, string>;
  FILTER_KEYS.forEach((k) => {
    init[k] = searchParams.get(k) ?? "";
  });
  return init;
}
