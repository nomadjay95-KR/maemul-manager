"use client";

import Link from "next/link";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useToast } from "@/components/ui/Toast";

interface RegisterButtonProps {
  href: string;
  label: string;
}

export default function RegisterButton({ href, label }: RegisterButtonProps) {
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  if (!isOnline) {
    return (
      <div className="fixed bottom-6 left-4 right-4 z-40 flex justify-center">
        <button
          type="button"
          onClick={() =>
            toast("오프라인 상태입니다. 인터넷 연결 후 시도해주세요", "error")
          }
          className="w-full max-w-[400px] h-[52px] rounded-xl text-[17px] font-bold bg-gray-400 text-white shadow-lg flex items-center justify-center cursor-not-allowed"
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 z-40 flex justify-center">
      <Link
        href={href}
        className="block w-full max-w-[400px] h-[52px] rounded-xl text-[17px] font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center"
      >
        {label}
      </Link>
    </div>
  );
}
