import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";

export default function NewInquiryPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main?tab=inquiries"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 문의 목록
        </Link>
        <h1 className="text-lg font-bold text-foreground">문의 등록</h1>
      </div>

      <InquiryForm />
    </main>
  );
}
