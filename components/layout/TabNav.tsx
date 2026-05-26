"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const MAIN_TABS = [
  { value: "properties", label: "매물장" },
  { value: "inquiries", label: "문의장" },
  { value: "calendar", label: "캘린더" },
] as const;

interface Props {
  role?: "admin" | "member";
}

export default function TabNav({ role }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "properties";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const moreTabs = useMemo(() => {
    const tabs = [
      { value: "statistics", label: "통계" },
      { value: "notes", label: "메모장" },
      { value: "shared-links", label: "공유 링크" },
    ];
    if (role === "admin") {
      tabs.push({ value: "users", label: "사용자 관리" });
    }
    return tabs;
  }, [role]);

  const allMoreValues = moreTabs.map((t) => t.value);
  const isMoreTab = allMoreValues.includes(currentTab);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [moreOpen]);

  return (
    <div className="flex border-b border-border">
      {MAIN_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => {
            router.push(`/main?tab=${tab.value}`);
            setMoreOpen(false);
          }}
          className={cn(
            "flex-1 sm:flex-none h-14 px-4 text-base sm:text-lg font-bold transition-colors relative",
            currentTab === tab.value
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {currentTab === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
          )}
        </button>
      ))}

      {/* 더보기 */}
      <div ref={moreRef} className="relative flex-1 sm:flex-none">
        <button
          onClick={() => setMoreOpen((prev) => !prev)}
          className={cn(
            "w-full h-14 px-4 text-base sm:text-lg font-bold transition-colors relative",
            isMoreTab
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          더보기
          {isMoreTab && (
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
          )}
        </button>

        {moreOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 min-w-[140px] overflow-hidden">
            {moreTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  router.push(`/main?tab=${tab.value}`);
                  setMoreOpen(false);
                }}
                className={cn(
                  "w-full h-[52px] px-5 text-left text-base font-semibold transition-colors",
                  currentTab === tab.value
                    ? "text-primary bg-primary/5"
                    : "text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
