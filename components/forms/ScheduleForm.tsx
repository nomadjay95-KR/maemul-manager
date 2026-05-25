"use client";

import { useState, useEffect } from "react";
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
import {
  calculateFee,
  getMonthlyRentAmount,
} from "@/lib/utils/brokerageFee";
import { formatPrice } from "@/lib/format/property";

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

const DEAL_TYPES: { value: DealType; label: string }[] = [
  { value: "sale", label: "매매" },
  { value: "jeonse", label: "전세" },
  { value: "monthly", label: "월세" },
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

  // 계약서 전용 상태
  const [contractDealType, setContractDealType] = useState<DealType>("sale");
  const [contractAmount, setContractAmount] = useState<string>("");
  const [monthlyDeposit, setMonthlyDeposit] = useState<string>("");
  const [monthlyRent, setMonthlyRent] = useState<string>("");

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

  // 매물 선택 시 거래유형 기본값 설정
  useEffect(() => {
    if (selectedCategory !== "contract" || !selectedProperty) return;
    setContractDealType(selectedProperty.deal_type as DealType);
  }, [watchedPropertyId, selectedProperty, selectedCategory]);

  // 수정 모드: 기존 데이터로 초기화
  useEffect(() => {
    if (!initialData || !selectedProperty) return;
    if (initialData.category !== "contract") return;

    setContractDealType(selectedProperty.deal_type as DealType);
    if (initialData.transaction_amount != null) {
      setContractAmount(String(initialData.transaction_amount));
    }
  }, [initialData, selectedProperty]);

  // 환산액 계산 (월세)
  const monthlyConvertedAmount = (() => {
    const dep = parseFloat(monthlyDeposit);
    const rent = parseFloat(monthlyRent);
    if (isNaN(dep) || isNaN(rent)) return null;
    return getMonthlyRentAmount(dep, rent);
  })();

  // 실제 거래금액 (fee 계산에 사용)
  const effectiveAmount = (() => {
    if (contractDealType === "monthly") {
      return monthlyConvertedAmount;
    }
    const val = parseFloat(contractAmount);
    return isNaN(val) || val <= 0 ? null : val;
  })();

  // 최대중개보수 자동 계산
  const maxFee =
    effectiveAmount != null && effectiveAmount > 0
      ? calculateFee(contractDealType, effectiveAmount)
      : null;

  // effectiveAmount → form value 동기화
  useEffect(() => {
    if (selectedCategory !== "contract") return;
    setValue(
      "transaction_amount",
      effectiveAmount != null && effectiveAmount > 0 ? effectiveAmount : null
    );
  }, [effectiveAmount, selectedCategory, setValue]);

  // category 변경 시 contract 전용 필드 초기화
  useEffect(() => {
    if (selectedCategory !== "contract") {
      setValue("transaction_amount", null);
      setValue("fee", null);
      setContractAmount("");
      setMonthlyDeposit("");
      setMonthlyRent("");
    }
  }, [selectedCategory, setValue]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors({});
    setSubmitting(true);

    try {
      const raw = getValues();
      if (!useTime) raw.schedule_time = null;
      if (raw.property_id === "") raw.property_id = null;
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

      {/* 시간 */}
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

      {/* 계약서 전용: 거래유형 + 금액 + 최대중개보수 */}
      {isContract && (
        <>
          {/* 거래유형 */}
          <Field label="거래유형" required>
            <div className="flex gap-2">
              {DEAL_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => {
                    setContractDealType(dt.value);
                    setContractAmount("");
                    setMonthlyDeposit("");
                    setMonthlyRent("");
                  }}
                  className={cn(
                    "flex-1 h-12 rounded-xl text-base font-semibold transition-colors",
                    contractDealType === dt.value
                      ? "bg-primary text-white"
                      : "bg-white text-muted-foreground border border-border"
                  )}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* 금액 입력 */}
          {contractDealType === "monthly" ? (
            <>
              <Field label="보증금" htmlFor="monthly_deposit">
                <div className="relative">
                  <Input
                    id="monthly_deposit"
                    type="number"
                    inputMode="numeric"
                    value={monthlyDeposit}
                    onChange={(e) => setMonthlyDeposit(e.target.value)}
                    placeholder="예: 500"
                    className="h-[52px] text-base pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                    만원
                  </span>
                </div>
              </Field>
              <Field label="월세" htmlFor="monthly_rent_input">
                <div className="relative">
                  <Input
                    id="monthly_rent_input"
                    type="number"
                    inputMode="numeric"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    placeholder="예: 50"
                    className="h-[52px] text-base pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                    만원
                  </span>
                </div>
              </Field>
              {monthlyConvertedAmount != null && (
                <p className="text-sm text-muted-foreground -mt-2">
                  환산액: {formatPrice(monthlyConvertedAmount)}
                </p>
              )}
            </>
          ) : (
            <Field label="거래금액" htmlFor="contract_amount">
              <div className="relative">
                <Input
                  id="contract_amount"
                  type="number"
                  inputMode="numeric"
                  value={contractAmount}
                  onChange={(e) => setContractAmount(e.target.value)}
                  placeholder="예: 15000"
                  className="h-[52px] text-base pr-14"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                  만원
                </span>
              </div>
            </Field>
          )}

          {/* 최대중개보수 + 실제중개보수 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <p className="text-sm font-bold text-muted-foreground mb-1">
                최대중개보수
              </p>
              <p className="text-2xl font-bold text-foreground">
                {maxFee != null ? formatPrice(maxFee) : "-"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">법정 상한</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-sm font-bold text-muted-foreground mb-1">
                실제중개보수
              </p>
              <div className="relative mt-1">
                <Input
                  id="fee"
                  type="number"
                  inputMode="numeric"
                  {...register("fee", { valueAsNumber: true })}
                  placeholder={maxFee != null ? String(maxFee) : "-"}
                  className="h-10 text-base pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  만원
                </span>
              </div>
            </div>
          </div>
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
                ? "일정 수정"
                : "일정 등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
