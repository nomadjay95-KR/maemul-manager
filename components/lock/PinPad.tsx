"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  userName: string;
  onBack: () => void;
}

export default function PinPad({ userId, userName, onBack }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNumber = (num: string) => {
    if (pin.length >= 4) return;

    const newPin = pin + num;
    setPin(newPin);
    setError("");

    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const verifyPin = async (inputPin: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, pin: inputPin }),
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("auth_user", JSON.stringify(data.user));
        router.push("/main");
        router.refresh();
      } else {
        setError("PIN이 일치하지 않습니다.");
        setPin("");
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      }
    } catch {
      setError("오류가 발생했습니다.");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 뒤로가기 + 사용자 이름 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-foreground">
          {userName}님, PIN을 입력해주세요
        </h1>
      </div>

      {/* PIN 표시 */}
      <div className="flex gap-5 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 border-foreground/30 transition-all",
              i < pin.length && "bg-foreground border-foreground",
              error && "border-destructive bg-destructive"
            )}
          />
        ))}
      </div>

      {/* 에러 메시지 */}
      <div className="h-6 text-base text-destructive font-medium">{error}</div>

      {/* 숫자 키패드 */}
      <div className="grid grid-cols-3 gap-5">
        {keys.map((key, idx) => {
          if (key === "") {
            return <div key={idx} className="w-[76px] h-[76px]" />;
          }

          if (key === "del") {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                disabled={isLoading || pin.length === 0}
                className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-xl font-medium text-foreground/70 active:bg-gray-100 transition-colors disabled:opacity-30"
              >
                ←
              </button>
            );
          }

          return (
            <button
              key={idx}
              onClick={() => handleNumber(key)}
              disabled={isLoading}
              className="w-[76px] h-[76px] rounded-full border border-border flex items-center justify-center text-2xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
