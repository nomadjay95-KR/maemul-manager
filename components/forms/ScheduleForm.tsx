"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  scheduleSchema,
  type ScheduleFormValues,
} from "@/lib/validations/schedule";
import type { Schedule } from "@/types/schedule";
import type { ScheduleCategory } from "@/types/schedule";
import type { DealType } from "@/types/property";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Field from "./Field";
import { useToast } from "@/components/ui/Toast";
import { CATEGORY_LABELS } from "@/components/calendar/ScheduleBadge";
import DeleteScheduleButton from "@/components/calendar/DeleteScheduleButton";
import { calculateFee, getMonthlyRentAmount } from "@/lib/utils/brokerageFee";

interface ScheduleFormProps {
  initialData?: Schedule;
  scheduleId?: string;
  defaultDate?: string;
}

interface PropertyOption {
  id: string;
  address: string;
  type: string;
  deal_type: string;
  deposit: number | null;
  monthly_rent: number | null;
  jeonse_price: number | null;
  sale_price: number | null;
}

const CATEGORIES: ScheduleCategory[] = [
  "contract",
  "move_in",
  "balance",
  "interim",
  "etc",
];

const DEAL_LABEL: Record<string, string> = {
  sale: "매매가",
  jeonse: "전세금",
  monthly: "환산액",
};

/** 매물의 거래유형에 따른 거래금액 산출 */
function getTransactionAmount(p: PropertyOption): number | null {
  switch (p.deal_type) {
    case "sale":
      return p.sale_price;
    case "jeonse":
      return p.jeonse_price;
    case "monthly":
      if (p.deposit != null && p.monthly_rent != null) {
        return getMonthlyRentAmount(p.deposit, p.monthly_rent);
      }
      return null;
    default:
      return null;
  }
}

export default function ScheduleForm({
  initialData,
  scheduleId,
  defaultDate,
}: ScheduleFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [useTime, setUseTime] = useState(!!initialData?.schedule_time);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [amountManuallyEdited, setAmountManuallyEdited] = useState(
    !!(initialData?.transaction_amount != null)
  );
  const [feeManuallyEdited, setFeeManuallyEdited] = useState(
    !!(initialData?.fee != null)
  );
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
          transaction_amount: initialData.transaction_amount,
          fee: initialData.fee,
        }
      : {
          title: "",
          schedule_date: defaultDate || today,
          schedule_time: null,
          category: "contract",
          property_id: null,
          memo: null,
          transaction_amount: null,
          fee: null,
        },
  });

  const selectedCategory = watch("category");
  const watchedPropertyId = watch("property_id");

  const selectedProperty = properties.find((p) => p.id === watchedPropertyId);

  // active 매물 목록 로드
  useEffect(() => {
    fetch("/api/properties/active")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProperties(data))
      .catch(() => setProperties([]));
  }, []);

  // 매물 선택 시 → 거래금액 + 복비 자동 채움
  const autoFillFromProperty = useCallback(
    (property: PropertyOption | undefined) => {
      if (!property || selectedCategory !== "contract") return;

      const amount = getTransactionAmount(property);
      if (amount == null) return;

      if (!amountManuallyEdited) {
        setValue("transaction_amount", amount);
      }

      const currentAmount = amountManuallyEdited
        ? getValues("transaction_amount")
        : amount;

      if (!feeManuallyEdited && currentAmount && !isNaN(currentAmount)) {
        const fee = calculateFee(property.deal_type as DealType, currentAmount);
        setValue("fee", fee);
      }
    },
    [
      selectedCategory,
      amountManuallyEdited,
      feeManuallyEdited,
      setValue,
      getValues,
    ]
  );

  // 매물 변경 시 자동 채움
  useEffect(() => {
    if (selectedCategory !== "contract" || !watchedPropertyId) return;
    const prop = properties.find((p) => p.id === watchedPropertyId);
    if (prop) autoFillFromProperty(prop);
  }, [watchedPropertyId, properties, selectedCategory, autoFillFromProperty]);

  // category 변경 시 contract 전용 필드 초기화
  useEffect(() => {
    if (selectedCategory !== "contract") {
      setValue("transaction_amount", null);
      setValue("fee", null);
      setAmountManuallyEdited(false);
      setFeeManuallyEdited(false);
    }
  }, [selectedCategory, setValue]);

  // 거래금액 수동 변경 시 복비 재계산
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountManuallyEdited(true);
    const val = e.target.valueAsNumber;

    if (!feeManuallyEdited && selectedProperty && !isNaN(val) && val > 0) {
      const fee = calculateFee(
        selectedProperty.deal_type as DealType,
        val
      );
      setValue("fee", fee);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors({});
    setSubmitting(true);

    try {
      const raw = getValues();
      // 시간 체크박스 OFF면 null
      if (!useTime) raw.schedule_time = null;
      // 빈 select → null
      if (raw.property_id === "") raw.property_id = null;
      // NaN 방어 (빈 number 입력)
      if (
        typeof raw.transaction_amount === "number" &&
        isNaN(raw.transaction_amount)
      )
        raw.transaction_amount = null;
      if (typeof raw.fee === "number" && isNaN(raw.fee)) raw.fee = null;

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

  const isContract = selectedCategory === "contract";

  // 거래금액 안내 텍스트
  const amountHint = (() => {
    if (!isContract || !selectedProperty) return null;
    const dt = selectedProperty.deal_type;
    const label = DEAL_LABEL[dt] || "";
    if (dt === "monthly" && selectedProperty.deposit != null && selectedProperty.monthly_rent != null) {
      return `${label} (보증금 + 월세 × 100)`;
    }
    return `${label} 기준`;
  })();

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
      <Field
        label={isContract ? "연결 매물" : "연결 매물 (선택)"}
        error={serverErrors.property_id}
        required={isContract}
      >
        <select
          {...register("property_id")}
          className="w-full h-[52px] px-3 rounded-xl border border-border text-base bg-white"
        >
          <option value="">
            {isContract ? "매물을 선택해주세요" : "매물 없음 (독립 일정)"}
          </option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.type === "villa" ? "[빌라]" : "[상가]"} {p.address}
            </option>
          ))}
        </select>
      </Field>

      {/* 계약서 전용: 거래금액 + 복비 */}
      {isContract && (
        <>
          <Field
            label="거래금액"
            htmlFor="transaction_amount"
            error={serverErrors.transaction_amount}
          >
            <div className="relative">
              <Input
                id="transaction_amount"
                type="number"
                inputMode="numeric"
                {...register("transaction_amount", {
                  valueAsNumber: true,
                  onChange: handleAmountChange,
                })}
                placeholder="매물 선택 시 자동 입력"
                className="h-[52px] text-base pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                만원
              </span>
            </div>
            {amountHint && (
              <p className="text-sm text-muted-foreground mt-1">
                {amountHint}
              </p>
            )}
          </Field>

          <Field label="중개보수" htmlFor="fee" error={serverErrors.fee}>
            <div className="relative">
              <Input
                id="fee"
                type="number"
                inputMode="numeric"
                {...register("fee", {
                  valueAsNumber: true,
                  onChange: () => setFeeManuallyEdited(true),
                })}
                placeholder="자동 계산"
                className="h-[52px] text-base pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                만원
              </span>
            </div>
            {!feeManuallyEdited && selectedProperty && (
              <p className="text-sm text-muted-foreground mt-1">
                법정 상한요율 기준 자동 계산
              </p>
            )}
          </Field>
        </>
      )}

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
