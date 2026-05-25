"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "properties", label: "매물장" },
  { value: "inquiries", label: "문의장" },
  { value: "calendar", label: "캘린더" },
  { value: "statistics", label: "통계" },
] as const;

export default function TabNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "properties";

  return (
    <div className="flex border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => router.push(`/main?tab=${tab.value}`)}
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
    </div>
  );
}
