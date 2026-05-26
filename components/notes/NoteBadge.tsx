import Link from "next/link";

interface NoteBadgeProps {
  type: "property" | "inquiry";
  id: string;
  label: string;
}

export default function NoteBadge({ type, id, label }: NoteBadgeProps) {
  const href =
    type === "property" ? `/properties/${id}` : `/inquiries/${id}`;
  const colorClass =
    type === "property"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  const prefix = type === "property" ? "매물" : "문의";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[13px] font-medium ${colorClass} hover:opacity-80 transition-opacity`}
    >
      <span>{prefix}</span>
      <span className="truncate max-w-[120px]">{label}</span>
    </Link>
  );
}
