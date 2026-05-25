"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import type { Property } from "@/types/property";
import { DEAL_LABEL, getPriceText } from "@/lib/format/property";

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: { mobileWebUrl: string; webUrl: string };
          };
          buttons: {
            title: string;
            link: { mobileWebUrl: string; webUrl: string };
          }[];
        }) => void;
      };
    };
  }
}

const STATUS_LABEL: Record<string, string> = {
  active: "가능",
  reserved: "계약중",
  completed: "완료",
};

export default function ShareButtons({ property }: { property: Property }) {
  const { toast } = useToast();
  const [sdkReady, setSdkReady] = useState(false);

  const pageUrl = `https://maemul-manager.vercel.app/properties/${property.id}`;
  const title = `[${property.type === "villa" ? "빌라" : "상가"}] ${property.address}`;
  const description = [
    `${DEAL_LABEL[property.deal_type]} ${getPriceText(property)}`,
    `상태: ${STATUS_LABEL[property.status] ?? property.status}`,
    property.notes ? `특이사항: ${property.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  useEffect(() => {
    const poll = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
          if (key) window.Kakao.init(key);
        }
        setSdkReady(true);
      } else {
        setTimeout(poll, 200);
      }
    };
    poll();
  }, []);

  const handleKakaoShare = () => {
    if (!sdkReady) {
      toast("카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해주세요", "error");
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: "https://maemul-manager.vercel.app/og-image.png",
        link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
      },
      buttons: [
        {
          title: "매물 보기",
          link: { mobileWebUrl: pageUrl, webUrl: pageUrl },
        },
      ],
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast("링크가 복사되었습니다", "success");
    } catch {
      toast("링크 복사에 실패했습니다", "error");
    }
  };

  return (
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
        onClick={handleCopyLink}
        className="h-[52px] px-5 rounded-xl text-base font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
      >
        링크 복사
      </button>
    </div>
  );
}
