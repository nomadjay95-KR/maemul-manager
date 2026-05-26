"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] bg-gray-700 text-white text-center py-2 text-base font-semibold">
      오프라인 상태입니다
    </div>
  );
}
