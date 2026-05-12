"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/auth-field";
import { PasswordToggle } from "@/components/auth/password-toggle";
import { Button } from "@/components/ui/button";
import { resetPasswordWithOtp } from "@/lib/auth-api";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Unable to reset password.";
  }

  return "Unable to reset password.";
}

export function ResetPasswordForm({
  initialEmail = "",
  initialOtp = "",
}: {
  initialEmail?: string;
  initialOtp?: string;
}) {
  const router = useRouter();
  const email = initialEmail;
  const otp = initialOtp;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      router.replace("/auth/forgot-password");
    }
  }, [email, otp, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordWithOtp({ email, otp, password });
      toast.success("Password reset successfully.");
      router.push(`/auth/signin?${new URLSearchParams({ email }).toString()}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthField
        label="New Password"
        icon={LockKeyhole}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your Password"
        type={isPasswordVisible ? "text" : "password"}
        autoComplete="new-password"
        rightSlot={<PasswordToggle isVisible={isPasswordVisible} onToggle={() => setIsPasswordVisible((value) => !value)} />}
        required
      />
      <AuthField
        label="Confirm Password"
        icon={LockKeyhole}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Enter Confirm Password"
        type={isConfirmPasswordVisible ? "text" : "password"}
        autoComplete="new-password"
        rightSlot={
          <PasswordToggle
            isVisible={isConfirmPasswordVisible}
            onToggle={() => setIsConfirmPasswordVisible((value) => !value)}
          />
        }
        required
      />
      <Button
        type="submit"
        className="h-[50px] w-full rounded-[8px] bg-[#6f97c0] text-[15px] font-medium text-white hover:bg-[#5f86ad]"
        disabled={isLoading}
      >
        {isLoading ? "Resetting..." : "Continue"}
      </Button>
    </form>
  );
}
