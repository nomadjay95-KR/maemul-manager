"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "name" | "pin" | "pinConfirm";

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNameSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (trimmed.length > 20) {
      setError("이름은 20자 이내로 입력해주세요.");
      return;
    }
    setName(trimmed);
    setError("");
    setStep("pin");
  };

  const handlePinInput = (num: string) => {
    if (step === "pin") {
      if (pin.length >= 4) return;
      const newPin = pin + num;
      setPin(newPin);
      setError("");
      if (newPin.length === 4) {
        setStep("pinConfirm");
      }
    } else if (step === "pinConfirm") {
      if (pinConfirm.length >= 4) return;
      const newConfirm = pinConfirm + num;
      setPinConfirm(newConfirm);
      setError("");
      if (newConfirm.length === 4) {
        submitSignup(newConfirm);
      }
    }
  };

  const handlePinDelete = () => {
    setError("");
    if (step === "pin") {
      setPin((prev) => prev.slice(0, -1));
    } else if (step === "pinConfirm") {
      setPinConfirm((prev) => prev.slice(0, -1));
    }
  };

  const submitSignup = async (confirmPin: string) => {
    if (pin !== confirmPin) {
      setError("PIN이 일치하지 않습니다. 다시 입력해주세요.");
      setPinConfirm("");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin, pinConfirm: confirmPin }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("auth_user", JSON.stringify(data.user));
        router.push("/main");
        router.refresh();
      } else {
        setError(data.error || "등록에 실패했습니다.");
        if (data.error?.includes("이름")) {
          setStep("name");
          setPin("");
          setPinConfirm("");
        } else {
          setPinConfirm("");
          setStep("pinConfirm");
        }
      }
    } catch {
      setError("오류가 발생했습니다.");
      setPinConfirm("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "pinConfirm") {
      setPinConfirm("");
      setPin("");
      setStep("pin");
    } else if (step === "pin") {
      setPin("");
      setStep("name");
    } else {
      router.push("/lock");
    }
  };

  const currentPin = step === "pin" ? pin : pinConfirm;
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  if (step === "name") {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold text-foreground">사용자 등록</h1>
        </div>

        <div className="w-full flex flex-col gap-4">
          <label className="text-base font-semibold text-foreground">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
            }}
            placeholder="이름을 입력해주세요"
            autoFocus
            className="w-full h-[52px] px-4 rounded-xl border border-border bg-white text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && (
            <p className="text-base text-destructive font-medium">{error}</p>
          )}
          <button
            onClick={handleNameSubmit}
            className="w-full h-[52px] rounded-xl bg-primary text-white text-lg font-bold hover:bg-primary/90 transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="text-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-foreground">
          {step === "pin" ? "PIN 4자리 설정" : "PIN 한 번 더 입력"}
        </h1>
      </div>

      {/* PIN 표시 */}
      <div className="flex gap-5 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              i < currentPin.length
                ? "bg-foreground border-foreground"
                : "border-foreground/30"
            } ${error ? "border-destructive bg-destructive" : ""}`}
          />
        ))}
      </div>

      {/* 에러 */}
      <div className="h-6 text-base text-destructive font-medium">{error}</div>

      {/* 키패드 */}
      <div className="grid grid-cols-3 gap-5">
        {keys.map((key, idx) => {
          if (key === "") {
            return <div key={idx} className="w-[76px] h-[76px]" />;
          }
          if (key === "del") {
            return (
              <button
                key={idx}
                onClick={handlePinDelete}
                disabled={isLoading || currentPin.length === 0}
                className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-xl font-medium text-foreground/70 active:bg-gray-100 transition-colors disabled:opacity-30"
              >
                ←
              </button>
            );
          }
          return (
            <button
              key={idx}
              onClick={() => handlePinInput(key)}
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
