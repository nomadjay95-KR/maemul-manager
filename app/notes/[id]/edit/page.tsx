import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchNoteById } from "@/lib/queries/notes";
import NoteForm from "@/components/forms/NoteForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: PageProps) {
  const { id } = await params;
  const note = await fetchNoteById(id);

  if (!note) return notFound();

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 pt-4 pb-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/main?tab=notes"
          className="text-muted-foreground hover:text-foreground text-2xl"
        >
          &larr;
        </Link>
        <h1 className="text-xl font-bold text-foreground">메모 수정</h1>
      </div>
      <NoteForm initialData={note} noteId={id} />
    </main>
  );
}
