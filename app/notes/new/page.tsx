import Link from "next/link";
import NoteForm from "@/components/forms/NoteForm";

export default function NewNotePage() {
  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 pt-4 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/main?tab=notes"
          className="text-muted-foreground hover:text-foreground text-2xl"
        >
          &larr;
        </Link>
        <h1 className="text-xl font-bold text-foreground">메모 작성</h1>
      </div>
      <NoteForm />
    </main>
  );
}
