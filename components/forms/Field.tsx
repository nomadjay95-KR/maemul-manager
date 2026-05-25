import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-base font-bold">
        {label}
        {required && <span className="text-destructive ml-1 text-sm font-medium">필수</span>}
      </Label>
      {children}
      {error && <p className="text-base text-destructive font-medium">{error}</p>}
    </div>
  );
}
