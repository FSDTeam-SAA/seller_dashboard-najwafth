"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, verifyPasswordResetOtp } from "@/lib/auth-api";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Unable to verify OTP.";
  }

  return "Unable to verify OTP.";
}

const OTP_LENGTH = 6;

export function EnterOtpForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const email = initialEmail;
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.replace("/auth/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsRemaining((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsRemaining]);

  const otp = digits.join("");

  function updateDigit(index: number, value: string) {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    setDigits(nextDigits);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] || "");
    setDigits(nextDigits);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || otp.length !== OTP_LENGTH) {
      toast.error("Enter the complete OTP.");
      return;
    }

    setIsLoading(true);

    try {
      await verifyPasswordResetOtp({ email, otp });
      toast.success("OTP verified.");
      router.push(`/auth/reset-password?${new URLSearchParams({ email, otp }).toString()}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendOtp() {
    if (!email || secondsRemaining > 0) {
      return;
    }

    setIsResending(true);

    try {
      await requestPasswordReset(email);
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      setSecondsRemaining(45);
      toast.success("OTP sent again.");
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <div className="flex justify-center gap-4" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            value={digit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            className="h-[72px] w-[72px] rounded-[10px] border border-[#8c8680] bg-transparent text-center text-[36px] font-semibold text-[#344765] outline-none transition focus:border-[#6f97c0]"
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
      <div className="space-y-3 text-center">
        <p className="text-[15px] text-[#8e8880]">Resend code in {secondsRemaining}s</p>
        <p className="text-[15px] text-[#2d2925]">
          Didn&apos;t Receive OTP?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            className="font-medium uppercase text-[#254b2f] transition hover:text-[#18321f] disabled:cursor-not-allowed disabled:text-[#8e8880]"
            disabled={isResending || secondsRemaining > 0}
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        </p>
      </div>
      <Button
        type="submit"
        className="h-[50px] w-full rounded-[8px] bg-[#6f97c0] text-[15px] font-medium text-white hover:bg-[#5f86ad]"
        disabled={isLoading}
      >
        {isLoading ? "Verifying..." : "Verify Now"}
      </Button>
    </form>
  );
}
