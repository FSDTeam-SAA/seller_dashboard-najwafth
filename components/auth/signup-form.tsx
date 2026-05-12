"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/auth-field";
import { PasswordToggle } from "@/components/auth/password-toggle";
import { Button } from "@/components/ui/button";
import { registerSeller } from "@/lib/auth-api";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || "Unable to create seller account.";
  }

  return "Unable to create seller account.";
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await registerSeller({ name, email, phone, password, confirmPassword });
      toast.success("Account created successfully.");
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
        label="User Name"
        icon={User}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Enter your First Name"
        autoComplete="name"
        required
      />
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
      <AuthField
        label="Phone Number"
        icon={Phone}
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Enter your phone number"
        type="tel"
        autoComplete="tel"
      />
      <AuthField
        label="Password"
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
        {isLoading ? "Signing up..." : "Sign up"}
      </Button>
      <p className="pt-2 text-center text-[15px] text-[#26221d]">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-[#1c74d9] transition hover:text-[#165aac]">
          Sign In Here
        </Link>
      </p>
    </form>
  );
}
