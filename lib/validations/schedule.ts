import { z } from "zod";

export const scheduleSchema = z
  .object({
    title: z.string().min(1, "제목을 입력해주세요."),
    schedule_date: z.string().min(1, "날짜를 선택해주세요."),
    schedule_time: z.string().nullable().default(null),
    category: z.enum(["contract", "move_in", "balance", "interim", "etc"]),
    property_id: z.string().nullable().default(null),
    memo: z.string().nullable().default(null),
    transaction_amount: z.number().int().positive().nullable().default(null),
    fee: z.number().int().min(0).nullable().default(null),
  })
  .superRefine((data, ctx) => {
    if (data.category === "contract" && !data.property_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "계약서 작성 시 매물을 선택해주세요.",
        path: ["property_id"],
      });
    }
  });

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
