"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { noteSchema, type NoteFormValues } from "@/lib/validations/note";
import type { Note } from "@/types/note";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Field from "./Field";
import { useToast } from "@/components/ui/Toast";
import DeleteNoteButton from "@/components/notes/DeleteNoteButton";

interface NoteFormProps {
  initialData?: Note;
  noteId?: string;
}

interface PropertyOption {
  id: string;
  address: string;
  type: string;
}

interface InquiryOption {
  id: string;
  name: string;
  phone: string;
}

export default function NoteForm({ initialData, noteId }: NoteFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [inquiries, setInquiries] = useState<InquiryOption[]>([]);
  const { toast } = useToast();
  const isEdit = !!noteId;

  const { register, getValues, setValue } = useForm<NoteFormValues>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          property_id: initialData.property_id,
          inquiry_id: initialData.inquiry_id,
        }
      : {
          title: "",
          content: null,
          property_id: null,
          inquiry_id: null,
        },
  });

  // 매물 목록 로드
  useEffect(() => {
    fetch("/api/properties/active")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setProperties(data);
        if (initialData?.property_id) {
          setValue("property_id", initialData.property_id);
        }
      })
      .catch(() => setProperties([]));
  }, [initialData?.property_id, setValue]);

  // 문의 목록 로드
  useEffect(() => {
    fetch("/api/inquiries")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setInquiries(data);
        if (initialData?.inquiry_id) {
          setValue("inquiry_id", initialData.inquiry_id);
        }
      })
      .catch(() => setInquiries([]));
  }, [initialData?.inquiry_id, setValue]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors({});
    setSubmitting(true);

    try {
      const raw = getValues();
      if (raw.property_id === "") raw.property_id = null;
      if (raw.inquiry_id === "") raw.inquiry_id = null;
      if (raw.content === "") raw.content = null;

      const parsed = noteSchema.safeParse(raw);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(fieldErrors)) {
          if (msgs && msgs.length > 0) mapped[key] = msgs[0];
        }
        setServerErrors(mapped);
        return;
      }

      const url = isEdit ? `/api/notes/${noteId}` : "/api/notes";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.ok) {
        toast("저장되었습니다", "success");
        window.location.href = "/main?tab=notes";
      } else {
        const body = await res.json().catch(() => null);
        toast(
          body?.error || "저장에 실패했습니다. 다시 시도해주세요",
          "error"
        );
      }
    } catch {
      toast("네트워크 오류가 발생했습니다", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 pb-24">
      {/* 제목 */}
      <Field label="제목" htmlFor="title" error={serverErrors.title} required>
        <Input
          id="title"
          {...register("title")}
          placeholder="메모 제목"
          className="h-[52px] text-base"
        />
      </Field>

      {/* 내용 */}
      <Field label="내용" htmlFor="content" error={serverErrors.content}>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="메모 내용을 입력하세요"
          rows={8}
          className="text-base"
        />
      </Field>

      {/* 연결 매물 */}
      <Field
        label="연결 매물 (선택)"
        error={serverErrors.property_id}
      >
        <select
          {...register("property_id")}
          className="w-full h-[52px] px-3 rounded-xl border border-border text-base bg-white"
        >
          <option value="">매물 없음</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.type === "villa" ? "[빌라]" : "[상가]"} {p.address}
            </option>
          ))}
        </select>
      </Field>

      {/* 연결 문의 */}
      <Field
        label="연결 문의 (선택)"
        error={serverErrors.inquiry_id}
      >
        <select
          {...register("inquiry_id")}
          className="w-full h-[52px] px-3 rounded-xl border border-border text-base bg-white"
        >
          <option value="">문의 없음</option>
          {inquiries.map((inq) => (
            <option key={inq.id} value={inq.id}>
              {inq.name} ({inq.phone})
            </option>
          ))}
        </select>
      </Field>

      {/* 수정 모드: 삭제 버튼 */}
      {isEdit && noteId && (
        <div className="flex justify-end">
          <DeleteNoteButton noteId={noteId} />
        </div>
      )}

      {/* 제출 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40">
        <div className="max-w-3xl mx-auto">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-14 text-lg flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting
              ? isEdit
                ? "수정 중..."
                : "등록 중..."
              : isEdit
                ? "메모 수정"
                : "메모 등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
