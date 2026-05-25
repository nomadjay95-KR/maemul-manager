"use client";

import { useAppLock } from "@/hooks/useAppLock";

export default function LockButton() {
  const { lock } = useAppLock();

  return (
    <button
      onClick={lock}
      className="h-12 px-4 rounded-lg text-[15px] font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
    >
      잠금
    </button>
  );
}
