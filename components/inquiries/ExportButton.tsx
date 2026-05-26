"use client";

import type { Inquiry } from "@/types/property";
import { exportInquiriesToXlsx } from "@/lib/export/xlsx";
import { useToast } from "@/components/ui/Toast";

interface ExportButtonProps {
  inquiries: Inquiry[];
}

export default function InquiryExportButton({ inquiries }: ExportButtonProps) {
  const { toast } = useToast();

  const handleExport = () => {
    if (inquiries.length === 0) return;
    try {
      exportInquiriesToXlsx(inquiries);
      toast("엑셀 파일이 다운로드되었습니다", "success");
    } catch {
      toast("내보내기에 실패했습니다", "error");
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={inquiries.length === 0}
      className="h-[48px] px-4 rounded-xl text-[15px] font-medium transition-colors whitespace-nowrap flex-shrink-0 bg-white text-muted-foreground border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
    >
      엑셀
    </button>
  );
}
