import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchInquiryById } from "@/lib/queries/inquiries";
import InquiryForm from "@/components/forms/InquiryForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInquiryPage({ params }: PageProps) {
  const { id } = await params;
  const inquiry = await fetchInquiryById(id);

  if (!inquiry) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/inquiries/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 돌아가기
        </Link>
        <h1 className="text-lg font-bold text-foreground">문의 수정</h1>
      </div>

      <InquiryForm initialData={inquiry} inquiryId={id} />
    </main>
  );
}
