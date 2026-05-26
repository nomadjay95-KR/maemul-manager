"use client";

import { useAuth } from "@/hooks/useAuth";

export default function LockButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="h-12 px-4 rounded-lg text-[15px] font-medium text-muted-foreground hover:bg-gray-100 transition-colors"
    >
      로그아웃
    </button>
  );
}
