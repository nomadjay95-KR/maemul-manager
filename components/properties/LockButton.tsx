"use client";

import { useAppLock } from "@/hooks/useAppLock";

export default function LockButton() {
  const { lock } = useAppLock();

  return (
    <button
      onClick={lock}
      className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
    >
      잠금
    </button>
  );
}
