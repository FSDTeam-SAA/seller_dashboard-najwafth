"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthField } from "@/components/auth/auth-field";
import { PasswordToggle } from "@/components/auth/password-toggle";
import { Button } from "@/components/ui/button";

export function LoginForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error("Unable to sign in as seller.");
      return;
    }

    toast.success("Signed in successfully.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthField
        label="User Email"
        icon={Mail}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your Email"
        type="email"
        autoComplete="email"
        required
      />
      <AuthField
        label="Password"
        icon={LockKeyhole}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Enter your Password"
        type={isPasswordVisible ? "text" : "password"}
        autoComplete="current-password"
        rightSlot={<PasswordToggle isVisible={isPasswordVisible} onToggle={() => setIsPasswordVisible((value) => !value)} />}
        required
      />
      <div className="flex items-center justify-between gap-3 text-[15px] text-[#77706a]">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded border border-[#bfb7ad] bg-transparent accent-[#7098c0]" />
          <span>Remember me</span>
        </label>
        <Link href="/auth/forgot-password" className="font-medium text-[#1c74d9] transition hover:text-[#165aac]">
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        className="h-[50px] w-full rounded-[8px] bg-[#6f97c0] text-[15px] font-medium text-white hover:bg-[#5f86ad]"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <p className="pt-1 text-center text-[15px] text-[#26221d]">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-[#1c74d9] transition hover:text-[#165aac]">
          Sign Up Here
        </Link>
      </p>
    </form>
  );
}
