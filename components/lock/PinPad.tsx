"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PinPad() {
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
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: inputPin }),
      });

      if (res.ok) {
        sessionStorage.setItem("app_unlocked", "true");
        router.push("/main");
        router.refresh();
      } else {
        setError("비밀번호가 틀렸습니다.");
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
    <div className="flex flex-col items-center gap-8">
      {/* PIN 표시 */}
      <div className="flex gap-4">
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
      <div className="h-5 text-sm text-destructive">{error}</div>

      {/* 숫자 키패드 */}
      <div className="grid grid-cols-3 gap-4">
        {keys.map((key, idx) => {
          if (key === "") {
            return <div key={idx} />;
          }

          if (key === "del") {
            return (
              <button
                key={idx}
                onClick={handleDelete}
                disabled={isLoading || pin.length === 0}
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-lg font-medium text-foreground/70 active:bg-muted transition-colors disabled:opacity-30"
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
              className="w-[72px] h-[72px] rounded-full border border-border flex items-center justify-center text-2xl font-medium hover:bg-muted active:bg-accent transition-colors disabled:opacity-50"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
