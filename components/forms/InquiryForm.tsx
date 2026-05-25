"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  inquirySchema,
  type InquiryFormValues,
} from "@/lib/validations/inquiry";
import type { Inquiry } from "@/types/property";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-[15px] font-bold">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface InquiryFormProps {
  initialData?: Inquiry;
  inquiryId?: string;
}

export default function InquiryForm({
  initialData,
  inquiryId,
}: InquiryFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const isEdit = !!inquiryId;

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    watch,
    setValue,
    getValues,
  } = useForm<InquiryFormValues>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          phone: initialData.phone,
          request_details: initialData.request_details,
          desired_deal_type: initialData.desired_deal_type,
          desired_deposit_min: initialData.desired_deposit_min,
          desired_deposit_max: initialData.desired_deposit_max,
          desired_rent_max: initialData.desired_rent_max,
          desired_rooms: initialData.desired_rooms,
          inquiry_date: initialData.inquiry_date,
          response_result: initialData.response_result,
          status: initialData.status,
        }
      : {
          name: "",
          phone: "",
          request_details: null,
          desired_deal_type: null,
          desired_deposit_min: null,
          desired_deposit_max: null,
          desired_rent_max: null,
          desired_rooms: null,
          inquiry_date: today,
          response_result: null,
          status: "active",
        },
  });

  const desiredDealType = watch("desired_deal_type");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors({});
    setSubmitting(true);

    try {
      const raw = getValues();
      const parsed = inquirySchema.safeParse(raw);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(fieldErrors)) {
          if (msgs && msgs.length > 0) mapped[key] = msgs[0];
        }
        setServerErrors(mapped);
        return;
      }

      const url = isEdit ? `/api/inquiries/${inquiryId}` : "/api/inquiries";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.ok) {
        const { id } = await res.json();
        toast("저장되었습니다", "success");
        window.location.href = `/inquiries/${id}`;
      } else {
        toast("저장에 실패했습니다. 다시 시도해주세요", "error");
      }
    } catch {
      toast("네트워크 오류가 발생했습니다", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 pb-24">
      {/* 기본 정보 */}
      <Field label="이름" htmlFor="name" error={serverErrors.name} required>
        <Input id="name" {...register("name")} placeholder="홍길동" />
      </Field>

      <Field label="연락처" htmlFor="phone" error={serverErrors.phone} required>
        <Input id="phone" {...register("phone")} placeholder="010-1234-5678" />
      </Field>

      <Field label="문의일" htmlFor="inquiry_date" error={serverErrors.inquiry_date} required>
        <Input id="inquiry_date" type="date" {...register("inquiry_date")} />
      </Field>

      {/* 희망 조건 */}
      <div className="space-y-5">
        <h3 className="text-[17px] font-bold text-muted-foreground border-b border-border pb-3">
          희망 조건
        </h3>

        <Field label="희망 거래유형">
          <div className="flex gap-2">
            {([null, "monthly", "jeonse", "sale"] as const).map((dt) => (
              <button
                key={String(dt)}
                type="button"
                onClick={() => setValue("desired_deal_type", dt)}
                className={cn(
                  "flex-1 h-12 rounded-xl text-base font-semibold transition-colors",
                  desiredDealType === dt
                    ? "bg-primary text-white"
                    : "bg-white text-muted-foreground border border-border"
                )}
              >
                {{ monthly: "월세", jeonse: "전세", sale: "매매", null: "무관" }[String(dt)]}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="보증금 최소 (만원)" htmlFor="desired_deposit_min">
            <Input
              id="desired_deposit_min"
              type="number"
              {...register("desired_deposit_min")}
              placeholder="500"
            />
          </Field>
          <Field label="보증금 최대 (만원)" htmlFor="desired_deposit_max">
            <Input
              id="desired_deposit_max"
              type="number"
              {...register("desired_deposit_max")}
              placeholder="3000"
            />
          </Field>
        </div>

        {desiredDealType === "monthly" && (
          <Field label="최대 월세 (만원)" htmlFor="desired_rent_max">
            <Input
              id="desired_rent_max"
              type="number"
              {...register("desired_rent_max")}
              placeholder="60"
            />
          </Field>
        )}

        <Field label="희망 방 개수 (이상)" htmlFor="desired_rooms">
          <Input
            id="desired_rooms"
            type="number"
            {...register("desired_rooms")}
            placeholder="2"
          />
        </Field>
      </div>

      {/* 문의 내용 */}
      <Field label="문의 내용" htmlFor="request_details">
        <Textarea
          id="request_details"
          {...register("request_details")}
          placeholder="고객 요청사항"
          rows={3}
        />
      </Field>

      {/* 응대 결과 (수정 모드에서만) */}
      {isEdit && (
        <Field label="응대 결과" htmlFor="response_result">
          <Textarea
            id="response_result"
            {...register("response_result")}
            placeholder="응대 결과를 기록하세요"
            rows={2}
          />
        </Field>
      )}

      {/* 제출 — 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40">
        <div className="max-w-3xl mx-auto">
          <Button type="submit" disabled={submitting} className="w-full h-14 text-lg">
            {submitting
              ? isEdit
                ? "수정 중..."
                : "등록 중..."
              : isEdit
                ? "문의 수정"
                : "문의 등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
