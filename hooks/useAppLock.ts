"use client";

import { useRouter } from "next/navigation";

export function useAppLock() {
  const router = useRouter();

  const isUnlocked =
    typeof window !== "undefined" &&
    sessionStorage.getItem("app_unlocked") === "true";

  const lock = async () => {
    sessionStorage.removeItem("app_unlocked");

    // 서버 쿠키 삭제를 위해 API 호출 대신 쿠키 만료 처리
    document.cookie = "app_unlocked=; path=/; max-age=0";

    router.push("/lock");
    router.refresh();
  };

  const unlock = () => {
    sessionStorage.setItem("app_unlocked", "true");
  };

  return { isUnlocked, lock, unlock };
}
