import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchScheduleById } from "@/lib/queries/schedules";
import ScheduleForm from "@/components/forms/ScheduleForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchedulePage({ params }: PageProps) {
  const { id } = await params;
  const schedule = await fetchScheduleById(id);

  if (!schedule) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/main?tab=calendar"
          className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 캘린더
        </Link>
        <h1 className="text-xl font-bold text-foreground">일정 수정</h1>
        <div className="w-10" />
      </div>

      <ScheduleForm initialData={schedule} scheduleId={id} />
    </main>
  );
}
