"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/auth-api";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Unable to send OTP.";
  }

  return "Unable to send OTP.";
}

export function ForgotPasswordForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      toast.success("OTP sent to your email.");
      router.push(`/auth/enter-otp?${new URLSearchParams({ email }).toString()}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthField
        label="Your Email"
        icon={Mail}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your Email"
        type="email"
        autoComplete="email"
        required
      />
      <Button
        type="submit"
        className="h-[50px] w-full rounded-[8px] bg-[#6f97c0] text-[15px] font-medium text-white hover:bg-[#5f86ad]"
        disabled={isLoading}
      >
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
}
