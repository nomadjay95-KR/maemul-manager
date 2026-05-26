"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserPublic } from "@/types/user";
import { deleteUser, changeUserRole, resetUserPin } from "@/lib/actions/user";
import { useToast } from "@/components/ui/Toast";

interface Props {
  user: UserPublic;
}

export default function UserActions({ user }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [showPinReset, setShowPinReset] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async () => {
    const newRole = user.role === "admin" ? "member" : "admin";
    const label = newRole === "admin" ? "관리자" : "멤버";

    setIsLoading(true);
    const result = await changeUserRole(user.id, newRole);
    setIsLoading(false);

    if ("error" in result) {
      toast(result.error, "error");
    } else {
      toast(`${user.name}님을 ${label}(으)로 변경했습니다.`, "success");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`${user.name}님을 삭제하시겠습니까?`)) return;

    setIsLoading(true);
    const result = await deleteUser(user.id);
    setIsLoading(false);

    if ("error" in result) {
      toast(result.error, "error");
    } else {
      toast(`${user.name}님이 삭제되었습니다.`, "success");
      router.refresh();
    }
  };

  const handlePinReset = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast("PIN은 숫자 4자리만 가능합니다.", "error");
      return;
    }

    setIsLoading(true);
    const result = await resetUserPin(user.id, { newPin });
    setIsLoading(false);

    if ("error" in result) {
      toast(result.error, "error");
    } else {
      toast(`${user.name}님의 PIN이 변경되었습니다.`, "success");
      setShowPinReset(false);
      setNewPin("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleRoleChange}
          disabled={isLoading}
          className="h-[44px] px-4 rounded-xl text-sm font-medium border border-border bg-white text-foreground hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          {user.role === "admin" ? "멤버로 변경" : "관리자로 변경"}
        </button>
        <button
          onClick={() => setShowPinReset(!showPinReset)}
          disabled={isLoading}
          className="h-[44px] px-4 rounded-xl text-sm font-medium border border-border bg-white text-foreground hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          PIN 재설정
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="h-[44px] px-4 rounded-xl text-sm font-medium border border-destructive/30 bg-white text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-40"
        >
          삭제
        </button>
      </div>

      {showPinReset && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            placeholder="새 PIN 4자리"
            className="h-[44px] w-32 px-3 rounded-xl border border-border bg-white text-base text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handlePinReset}
            disabled={isLoading || newPin.length !== 4}
            className="h-[44px] px-4 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            변경
          </button>
        </div>
      )}
    </div>
  );
}
