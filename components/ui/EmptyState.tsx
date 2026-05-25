export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  );
}
