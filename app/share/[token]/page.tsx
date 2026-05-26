import { Metadata } from "next";
import {
  fetchSharedLink,
  incrementViewCount,
  fetchPublicProperties,
} from "@/lib/queries/share";
import SharePageClient from "./SharePageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "매물 정보 - 하나부동산",
  description: "하나부동산 매물 정보",
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: PageProps) {
  const { token } = await params;
  const link = await fetchSharedLink(token);

  if (!link || !link.is_active) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            유효하지 않은 링크입니다
          </h1>
          <p className="text-base text-muted-foreground">
            이 링크는 만료되었거나 존재하지 않습니다.
          </p>
        </div>
      </main>
    );
  }

  // 조회수 증가
  await incrementViewCount(link.id);

  const properties = await fetchPublicProperties(link.property_ids);

  return <SharePageClient properties={properties} />;
}
