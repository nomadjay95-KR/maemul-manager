"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  propertySchema,
  type PropertyFormValues,
} from "@/lib/validations/property";
import type { PropertyWithImages } from "@/types/property";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ImageUpload from "./ImageUpload";
import AddressSearch from "./AddressSearch";
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

interface PropertyFormProps {
  initialData?: PropertyWithImages;
  propertyId?: string;
}

export default function PropertyForm({
  initialData,
  propertyId,
}: PropertyFormProps) {
  const newImagesRef = useRef<File[]>([]);
  const deletedIdsRef = useRef<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const isEdit = !!propertyId;

  const {
    register,
    watch,
    setValue,
    getValues,
  } = useForm<PropertyFormValues>({
    defaultValues: initialData
      ? {
          type: initialData.type,
          address: initialData.address,
          deal_type: initialData.deal_type,
          occupancy_status: initialData.occupancy_status,
          deposit: initialData.deposit,
          monthly_rent: initialData.monthly_rent,
          jeonse_price: initialData.jeonse_price,
          sale_price: initialData.sale_price,
          move_out_month: initialData.move_out_month,
          owner_phone: initialData.owner_phone,
          owner_personality: initialData.owner_personality,
          door_password: initialData.door_password,
          notes: initialData.notes,
          memo: initialData.memo,
          unit_number: initialData.unit_number,
          rooms: initialData.rooms,
          lighting: initialData.lighting,
          repair_status: initialData.repair_status,
          building_age: initialData.building_age,
          loan_available: initialData.loan_available,
          floor: initialData.floor,
          area: initialData.area,
          premium: initialData.premium,
          business_restriction: initialData.business_restriction,
        }
      : {
          type: "villa",
          deal_type: "monthly",
          occupancy_status: "vacant",
          deposit: null,
          monthly_rent: null,
          jeonse_price: null,
          sale_price: null,
          move_out_month: null,
          owner_phone: null,
          owner_personality: null,
          door_password: null,
          notes: null,
          memo: null,
          unit_number: null,
          rooms: null,
          lighting: null,
          repair_status: null,
          building_age: null,
          loan_available: null,
          floor: null,
          area: null,
          premium: null,
          business_restriction: null,
        },
  });

  const propertyType = watch("type");
  const dealType = watch("deal_type");

  const handleImageChange = (files: File[], deletedIds: string[]) => {
    newImagesRef.current = files;
    deletedIdsRef.current = deletedIds;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerErrors({});
    setSubmitting(true);

    try {
      const raw = getValues();
      const parsed = propertySchema.safeParse(raw);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(fieldErrors)) {
          if (msgs && msgs.length > 0) mapped[key] = msgs[0];
        }
        setServerErrors(mapped);
        return;
      }

      const formData = new FormData();
      formData.set("data", JSON.stringify(parsed.data));
      const filesToUpload = newImagesRef.current;
      filesToUpload.forEach((file) => formData.append("images", file));
      const idsToDelete = deletedIdsRef.current;
      if (idsToDelete.length > 0) {
        formData.set("deletedImageIds", JSON.stringify(idsToDelete));
      }

      const url = isEdit ? `/api/properties/${propertyId}` : "/api/properties";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (res.ok) {
        const { id } = await res.json();
        toast("저장되었습니다", "success");
        window.location.href = `/properties/${id}`;
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
      {/* 타입 탭 */}
      <div className="flex gap-2">
        {(["villa", "shop"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue("type", t)}
            className={cn(
              "flex-1 h-12 rounded-xl text-base font-semibold transition-colors",
              propertyType === t
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground border border-border"
            )}
          >
            {t === "villa" ? "빌라" : "상가"}
          </button>
        ))}
      </div>

      {/* 사진 */}
      <div>
        <Label className="text-[15px] font-bold mb-2 block">사진 (최대 3장)</Label>
        <ImageUpload
          existingImages={initialData?.images}
          onChange={handleImageChange}
        />
      </div>

      {/* 주소 */}
      <Field label="주소" error={serverErrors.address} required>
        <AddressSearch
          value={watch("address") || ""}
          onChange={(addr) => setValue("address", addr)}
        />
      </Field>

      {/* 거래 유형 */}
      <Field label="거래 유형" error={serverErrors.deal_type} required>
        <div className="flex gap-2">
          {(["monthly", "jeonse", "sale"] as const).map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => setValue("deal_type", dt)}
              className={cn(
                "flex-1 h-12 rounded-xl text-base font-semibold transition-colors",
                dealType === dt
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {{ monthly: "월세", jeonse: "전세", sale: "매매" }[dt]}
            </button>
          ))}
        </div>
      </Field>

      {/* 가격 필드 */}
      {dealType === "monthly" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="보증금 (만원)" htmlFor="deposit" error={serverErrors.deposit} required>
            <Input id="deposit" type="number" {...register("deposit")} placeholder="1000" />
          </Field>
          <Field label="월세 (만원)" htmlFor="monthly_rent" error={serverErrors.monthly_rent} required>
            <Input
              id="monthly_rent"
              type="number"
              {...register("monthly_rent")}
              placeholder="50"
            />
          </Field>
        </div>
      )}
      {dealType === "jeonse" && (
        <Field label="전세금 (만원)" htmlFor="jeonse_price" error={serverErrors.jeonse_price} required>
          <Input
            id="jeonse_price"
            type="number"
            {...register("jeonse_price")}
            placeholder="15000"
          />
        </Field>
      )}
      {dealType === "sale" && (
        <Field label="매매가 (만원)" htmlFor="sale_price" error={serverErrors.sale_price} required>
          <Input
            id="sale_price"
            type="number"
            {...register("sale_price")}
            placeholder="30000"
          />
        </Field>
      )}

      {/* 입주 상태 */}
      <Field label="입주 상태">
        <div className="flex gap-2">
          {(["vacant", "occupied"] as const).map((os) => (
            <button
              key={os}
              type="button"
              onClick={() => setValue("occupancy_status", os)}
              className={cn(
                "flex-1 h-12 rounded-xl text-base font-semibold transition-colors",
                watch("occupancy_status") === os
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {os === "vacant" ? "공실" : "입주중"}
            </button>
          ))}
        </div>
      </Field>

      <Field label="이사 예정월" htmlFor="move_out_month">
        <Input id="move_out_month" type="month" {...register("move_out_month")} />
      </Field>

      {/* 빌라 전용 */}
      {propertyType === "villa" && (
        <div className="space-y-4">
          <h3 className="text-[17px] font-bold text-muted-foreground border-b border-border pb-3">
            빌라 정보
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="호수" htmlFor="unit_number">
              <Input id="unit_number" {...register("unit_number")} placeholder="201호" />
            </Field>
            <Field label="방 개수" htmlFor="rooms">
              <Input id="rooms" type="number" {...register("rooms")} placeholder="2" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="채광" htmlFor="lighting">
              <Input id="lighting" {...register("lighting")} placeholder="좋음" />
            </Field>
            <Field label="수리 상태" htmlFor="repair_status">
              <Input id="repair_status" {...register("repair_status")} placeholder="올수리" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="연식 (년)" htmlFor="building_age">
              <Input
                id="building_age"
                type="number"
                {...register("building_age")}
                placeholder="15"
              />
            </Field>
            <Field label="대출 가능">
              <div className="flex gap-2 mt-1">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setValue("loan_available", v)}
                    className={cn(
                      "flex-1 h-12 rounded-xl text-base font-semibold transition-colors",
                      watch("loan_available") === v
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {v ? "가능" : "불가"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>
      )}

      {/* 상가 전용 */}
      {propertyType === "shop" && (
        <div className="space-y-4">
          <h3 className="text-[17px] font-bold text-muted-foreground border-b border-border pb-3">
            상가 정보
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="층수" htmlFor="floor">
              <Input id="floor" {...register("floor")} placeholder="1층" />
            </Field>
            <Field label="면적 (m²)" htmlFor="area">
              <Input
                id="area"
                type="number"
                step="0.01"
                {...register("area")}
                placeholder="45.5"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="권리금 (만원)" htmlFor="premium">
              <Input
                id="premium"
                type="number"
                {...register("premium")}
                placeholder="5000"
              />
            </Field>
            <Field label="업종 제한" htmlFor="business_restriction">
              <Input
                id="business_restriction"
                {...register("business_restriction")}
                placeholder="음식점 불가"
              />
            </Field>
          </div>
        </div>
      )}

      {/* 연락처 / 보안 */}
      <div className="space-y-4">
        <h3 className="text-[17px] font-bold text-muted-foreground border-b border-border pb-3">
          연락처 / 보안
        </h3>
        <Field label="집주인 연락처" htmlFor="owner_phone">
          <Input id="owner_phone" {...register("owner_phone")} placeholder="010-1234-5678" />
        </Field>
        <Field label="임대인 성향" htmlFor="owner_personality">
          <Input id="owner_personality" {...register("owner_personality")} placeholder="온화함" />
        </Field>
        <Field label="현관 비밀번호" htmlFor="door_password">
          <Input id="door_password" {...register("door_password")} placeholder="1234#" />
        </Field>
      </div>

      {/* 기타 */}
      <div className="space-y-4">
        <h3 className="text-[17px] font-bold text-muted-foreground border-b border-border pb-3">
          기타
        </h3>
        <Field label="특이사항" htmlFor="notes">
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="역세권 도보 5분"
            rows={2}
          />
        </Field>
        <Field label="메모" htmlFor="memo">
          <Textarea id="memo" {...register("memo")} placeholder="자유 메모" rows={2} />
        </Field>
      </div>

      {/* 제출 — 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-40">
        <div className="max-w-3xl mx-auto">
          <Button type="submit" disabled={submitting} className="w-full h-14 text-lg">
            {submitting
              ? isEdit
                ? "수정 중..."
                : "등록 중..."
              : isEdit
                ? "매물 수정"
                : "매물 등록"}
          </Button>
        </div>
      </div>
    </form>
  );
}
