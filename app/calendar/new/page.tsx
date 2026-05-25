import Link from "next/link";
import ScheduleForm from "@/components/forms/ScheduleForm";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function NewSchedulePage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main?tab=calendar"
          className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 캘린더
        </Link>
        <h1 className="text-xl font-bold text-foreground">일정 등록</h1>
        <div className="w-10" />
      </div>

      <ScheduleForm defaultDate={params.date} />
    </main>
  );
}
