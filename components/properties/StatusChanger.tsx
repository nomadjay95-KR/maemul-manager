"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { PropertyStatus } from "@/types/property";

const OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: "active", label: "가능" },
  { value: "reserved", label: "계약중" },
  { value: "completed", label: "완료" },
];

export default function StatusChanger({
  propertyId,
  currentStatus,
}: {
  propertyId: string;
  currentStatus: PropertyStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = async (status: PropertyStatus) => {
    if (status === currentStatus || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast("상태가 변경되었습니다", "success");
        router.refresh();
      } else {
        toast("상태 변경에 실패했습니다", "error");
      }
    } catch {
      toast("네트워크 오류가 발생했습니다", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          disabled={loading}
          className={cn(
            "h-[52px] flex-1 rounded-xl text-base font-semibold transition-colors",
            currentStatus === opt.value
              ? "bg-primary text-white"
              : "bg-white text-muted-foreground border border-border hover:bg-gray-50",
            loading && "opacity-50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
