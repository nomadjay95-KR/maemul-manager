"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
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

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
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
  const router = useRouter();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!propertyId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as Resolver<PropertyFormValues>,
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
    setNewImages(files);
    setDeletedImageIds(deletedIds);
  };

  const onSubmit = async (data: PropertyFormValues) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("data", JSON.stringify(data));
      newImages.forEach((file) => formData.append("images", file));
      if (deletedImageIds.length > 0) {
        formData.set("deletedImageIds", JSON.stringify(deletedImageIds));
      }

      const url = isEdit ? `/api/properties/${propertyId}` : "/api/properties";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (res.ok) {
        const { id } = await res.json();
        router.push(`/properties/${id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* 타입 탭 */}
      <div className="flex gap-2">
        {(["villa", "shop"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue("type", t)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              propertyType === t
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
            )}
          >
            {t === "villa" ? "빌라" : "상가"}
          </button>
        ))}
      </div>

      {/* 사진 */}
      <div>
        <Label className="text-sm mb-2 block">사진 (최대 3장)</Label>
        <ImageUpload
          existingImages={initialData?.images}
          onChange={handleImageChange}
        />
      </div>

      {/* 주소 */}
      <Field label="주소 *" error={errors.address?.message}>
        <Input
          {...register("address")}
          placeholder="예: 서울시 관악구 봉천동 123-4"
        />
      </Field>

      {/* 거래 유형 */}
      <Field label="거래 유형 *" error={errors.deal_type?.message}>
        <div className="flex gap-2">
          {(["monthly", "jeonse", "sale"] as const).map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => setValue("deal_type", dt)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
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
          <Field label="보증금 (만원) *" error={errors.deposit?.message}>
            <Input type="number" {...register("deposit")} placeholder="1000" />
          </Field>
          <Field label="월세 (만원) *" error={errors.monthly_rent?.message}>
            <Input
              type="number"
              {...register("monthly_rent")}
              placeholder="50"
            />
          </Field>
        </div>
      )}
      {dealType === "jeonse" && (
        <Field label="전세금 (만원) *" error={errors.jeonse_price?.message}>
          <Input
            type="number"
            {...register("jeonse_price")}
            placeholder="15000"
          />
        </Field>
      )}
      {dealType === "sale" && (
        <Field label="매매가 (만원) *" error={errors.sale_price?.message}>
          <Input
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
                "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
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

      <Field label="이사 예정월">
        <Input type="month" {...register("move_out_month")} />
      </Field>

      {/* 빌라 전용 */}
      {propertyType === "villa" && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold border-b border-border pb-2">
            빌라 정보
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="호수">
              <Input {...register("unit_number")} placeholder="201호" />
            </Field>
            <Field label="방 개수">
              <Input type="number" {...register("rooms")} placeholder="2" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="채광">
              <Input {...register("lighting")} placeholder="좋음" />
            </Field>
            <Field label="수리 상태">
              <Input {...register("repair_status")} placeholder="올수리" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="연식 (년)">
              <Input
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
                      "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
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
          <h3 className="text-sm font-semibold border-b border-border pb-2">
            상가 정보
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="층수">
              <Input {...register("floor")} placeholder="1층" />
            </Field>
            <Field label="면적 (m²)">
              <Input
                type="number"
                step="0.01"
                {...register("area")}
                placeholder="45.5"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="권리금 (만원)">
              <Input
                type="number"
                {...register("premium")}
                placeholder="5000"
              />
            </Field>
            <Field label="업종 제한">
              <Input
                {...register("business_restriction")}
                placeholder="음식점 불가"
              />
            </Field>
          </div>
        </div>
      )}

      {/* 연락처 / 보안 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          연락처 / 보안
        </h3>
        <Field label="집주인 연락처">
          <Input {...register("owner_phone")} placeholder="010-1234-5678" />
        </Field>
        <Field label="임대인 성향">
          <Input {...register("owner_personality")} placeholder="온화함" />
        </Field>
        <Field label="현관 비밀번호">
          <Input {...register("door_password")} placeholder="1234#" />
        </Field>
      </div>

      {/* 기타 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          기타
        </h3>
        <Field label="특이사항">
          <Textarea
            {...register("notes")}
            placeholder="역세권 도보 5분"
            rows={2}
          />
        </Field>
        <Field label="메모">
          <Textarea {...register("memo")} placeholder="자유 메모" rows={2} />
        </Field>
      </div>

      {/* 제출 */}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting
          ? isEdit
            ? "수정 중..."
            : "등록 중..."
          : isEdit
            ? "매물 수정"
            : "매물 등록"}
      </Button>
    </form>
  );
}
