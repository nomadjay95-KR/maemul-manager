import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";

export default function NewInquiryPage() {
  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main?tab=inquiries"
          className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 문의 목록
        </Link>
        <h1 className="text-xl font-bold text-foreground">문의 등록</h1>
        <div className="w-10" />
      </div>

      <InquiryForm />
    </main>
  );
}
