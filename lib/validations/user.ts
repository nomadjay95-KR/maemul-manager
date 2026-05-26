import { z } from "zod";

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "이름을 입력해주세요.")
      .max(20, "이름은 20자 이내로 입력해주세요."),
    pin: z
      .string()
      .length(4, "PIN은 4자리를 입력해주세요.")
      .regex(/^\d{4}$/, "PIN은 숫자 4자리만 가능합니다."),
    pinConfirm: z.string().length(4, "PIN 확인을 입력해주세요."),
  })
  .refine((data) => data.pin === data.pinConfirm, {
    message: "PIN이 일치하지 않습니다.",
    path: ["pinConfirm"],
  });

export const resetPinSchema = z.object({
  newPin: z
    .string()
    .length(4, "PIN은 4자리를 입력해주세요.")
    .regex(/^\d{4}$/, "PIN은 숫자 4자리만 가능합니다."),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
