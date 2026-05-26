"use client";

import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  name: string;
  role: "admin" | "member";
}

export function useAuth() {
  const router = useRouter();

  const getUser = (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("auth_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const logout = async () => {
    sessionStorage.removeItem("auth_user");
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/lock");
    router.refresh();
  };

  return { getUser, logout };
}
