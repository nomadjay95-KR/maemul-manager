"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export default function CreateShareLinkButton({
  propertyIds,
  label,
}: {
  propertyIds: string[];
  label?: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shared-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyIds }),
      });
      const result = await res.json();

      if (!res.ok || result.error) {
        toast(result.error || "공유 링크 생성에 실패했습니다", "error");
        return;
      }

      const url = `${window.location.origin}/share/${result.token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast("링크가 복사되었습니다", "success");
    } catch {
      toast("공유 링크 생성에 실패했습니다", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("링크가 복사되었습니다", "success");
    } catch {
      toast("링크 복사에 실패했습니다", "error");
    }
  };

  const handleKakaoShare = () => {
    if (!shareUrl) return;
    if (!window.Kakao?.isInitialized()) {
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if (key) window.Kakao.init(key);
    }
    if (!window.Kakao?.isInitialized()) {
      toast("카카오 SDK 로딩 중입니다", "error");
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: propertyIds.length === 1 ? "매물 정보" : `매물 ${propertyIds.length}건`,
        description: "하나부동산에서 보내드린 매물 정보입니다.",
        imageUrl: "https://maemul-manager.vercel.app/og-image.png",
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
      buttons: [
        {
          title: "매물 보기",
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
      ],
    });
  };

  if (shareUrl) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-muted-foreground mb-2">공유 링크</p>
          <p className="text-base text-foreground break-all font-mono">
            {shareUrl}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleKakaoShare}
            className="flex-1 h-[52px] rounded-xl text-base font-semibold bg-[#FEE500] text-[#191919] hover:bg-[#FDD800] transition-colors flex items-center justify-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.66 6.6l-1.2 4.38c-.1.38.34.68.66.46l5.04-3.36c.28.02.56.02.84.02 5.52 0 10-3.58 10-7.9S17.52 3 12 3z"
                fill="#191919"
              />
            </svg>
            카카오톡 공유
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="h-[52px] px-5 rounded-xl text-base font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            링크 복사
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={loading || propertyIds.length === 0}
      className="w-full h-[52px] rounded-xl text-base font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {label || "고객 공유 링크 만들기"}
        </>
      )}
    </button>
  );
}
