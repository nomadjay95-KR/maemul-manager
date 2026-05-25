import Link from "next/link";
import PropertyForm from "@/components/forms/PropertyForm";

export default function NewPropertyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 목록
        </Link>
        <h1 className="text-lg font-bold text-foreground">매물 등록</h1>
        <div className="w-10" />
      </div>

      <PropertyForm />
    </main>
  );
}
