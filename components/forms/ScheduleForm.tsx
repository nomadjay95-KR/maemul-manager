"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  scheduleSchema,
  type ScheduleFormValues,
} from "@/lib/validations/schedule";
import type { Schedule } from "@/types/schedule";
import type { ScheduleCategory } from "@/types/schedule";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Field from "./Field";
import { useToast } from "@/components/ui/Toast";
import { CATEGORY_LABELS } from "@/components/calendar/ScheduleBadge";
import DeleteScheduleButton from "@/components/calendar/DeleteScheduleButton";

interface ScheduleFormProps {
  initialData?: Schedule;
  scheduleId?: string;
  defaultDate?: string;
}

interface PropertyOption {
  id: string;
  address: string;
  type: string;
}

const CATEGORIES: ScheduleCategory[] = [
  "contract",
  "move_in",
  "balance",
  "interim",
  "etc",
];

export default function ScheduleForm({
  initialData,
  scheduleId,
  defaultDate,
}: ScheduleFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [useTime, setUseTime] = useState(!!initialData?.schedule_time);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const { toast } = useToast();
  const isEdit = !!scheduleId;

  const today = new Date().toISOString().split("T")[0];

  const { register, watch, setValue, getValues } = useForm<ScheduleFormValues>({
    defaultValues: initialData
      ? {
          title: initialData.title,
          schedule_date: initialData.schedule_date,
          schedule_time: initialData.schedule_time,
          category: initialData.category,
          property_id: initialData.property_id,
          memo: initialData.memo,
        }
      : {
          title: "",
          schedule_date: defaultDate || today,
          schedule_time: null,
          category: "contract",
          property_id: null,
          memo: null,
        },
  });

  const selectedCategory = watch("category");

  // active 매물 목록 로드
  useEffect(() => {
    fetch("/api/properties/active")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProperties(data))
      .catch(() => setProperties([]));
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors({});
    setSubmitting(true);

    try {
      const raw = getValues();
      // 시간 체크박스 OFF면 null
      if (!useTime) raw.schedule_time = null;

      const parsed = scheduleSchema.safeParse(raw);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(fieldErrors)) {
          if (msgs && msgs.length > 0) mapped[key] = msgs[0];
        }
        setServerErrors(mapped);
        return;
      }

      const url = isEdit ? `/api/schedules/${scheduleId}` : "/api/schedules";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.ok) {
        toast("저장되었습니다", "success");
        window.location.href = "/main?tab=calendar";
      } else {
        const body = await res.json().catch(() => null);
        toast(body?.error || "저장에 실패했습니다. 다시 시도해주세요", "error");
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
          placeholder="예: 301호 계약서 작성"
          className="h-[52px] text-base"
        />
      </Field>

      {/* 날짜 */}
      <Field
        label="날짜"
        htmlFor="schedule_date"
        error={serverErrors.schedule_date}
        required
      >
        <Input
          id="schedule_date"
          type="date"
          {...register("schedule_date")}
          className="h-[52px] text-base"
        />
      </Field>

      {/* 시간 (체크박스 ON/OFF) */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useTime}
            onChange={(e) => {
              setUseTime(e.target.checked);
              if (!e.target.checked) setValue("schedule_time", null);
            }}
            className="w-5 h-5 rounded border-border"
          />
          <span className="text-base font-bold">시간 지정</span>
        </label>
        {useTime && (
          <Input
            id="schedule_time"
            type="time"
            {...register("schedule_time")}
            className="h-[52px] text-base"
          />
        )}
      </div>

      {/* 종류 */}
      <Field label="종류" error={serverErrors.category} required>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setValue("category", cat)}
              className={cn(
                "h-12 px-4 rounded-xl text-base font-semibold transition-colors",
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground border border-border"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </Field>

      {/* 연결 매물 */}
      <Field label="연결 매물 (선택)">
        <select
          {...register("property_id")}
          className="w-full h-[52px] px-3 rounded-xl border border-border text-base bg-white"
        >
          <option value="">매물 없음 (독립 일정)</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.type === "villa" ? "[빌라]" : "[상가]"} {p.address}
            </option>
          ))}
        </select>
      </Field>

      {/* 메모 */}
      <Field label="메모" htmlFor="memo">
        <Textarea
          id="memo"
          {...register("memo")}
          placeholder="추가 메모"
          rows={3}
          className="text-base"
        />
      </Field>

      {/* 수정 모드: 삭제 버튼 */}
      {isEdit && scheduleId && (
        <div className="flex justify-end">
          <DeleteScheduleButton scheduleId={scheduleId} />
        </div>
      )}

      {/* 제출 — 하단 고정 */}
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
                ? "일정 수정"
                : "일정 등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
