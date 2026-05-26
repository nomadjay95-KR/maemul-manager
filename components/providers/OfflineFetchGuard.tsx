"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

export default function OfflineFetchGuard() {
  const { toast } = useToast();

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const [, init] = args;
      const method = (init?.method || "GET").toUpperCase();

      if (method !== "GET" && method !== "HEAD" && !navigator.onLine) {
        toast("오프라인 상태입니다. 인터넷 연결 후 시도해주세요", "error");
        return Promise.reject(new Error("Offline"));
      }

      return originalFetch.apply(this, args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [toast]);

  return null;
}
