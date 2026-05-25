import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchPropertyById } from "@/lib/queries/properties";
import PropertyForm from "@/components/forms/PropertyForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const property = await fetchPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/properties/${id}`}
          className="h-12 inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 상세
        </Link>
        <h1 className="text-xl font-bold text-foreground">매물 수정</h1>
        <div className="w-10" />
      </div>

      <PropertyForm initialData={property} propertyId={id} />
    </main>
  );
}
