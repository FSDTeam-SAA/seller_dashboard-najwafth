"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("seller@gmail.com");
  const [password, setPassword] = useState("123456");
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
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden bg-[#eef4ff] px-12 py-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-4">
          <Image src="/assets/brand-mark.png" alt="Brand mark" width={72} height={72} />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2E6FF3]">Seller portal</p>
            <h1 className="mt-2 text-[32px] font-semibold leading-[120%] text-slate-900">
              Manage Your Inventory & Orders
            </h1>
          </div>
        </div>
        <div className="mx-auto max-w-xl">
          <Image
            src="/assets/seller-hero.png"
            alt="Seller dashboard illustration"
            width={520}
            height={520}
            className="mx-auto h-auto w-full"
            priority
          />
          <p className="mt-8 text-center text-base font-medium leading-[120%] text-slate-600">
            Add books quickly with a simple interface and track orders from placement to delivery seamlessly.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-[#fcfcfd] px-5 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-[496px] rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mx-auto mb-8 flex h-[152px] w-[240px] items-center justify-center">
            <Image src="/assets/brand-mark.png" alt="Logo" width={240} height={152} className="h-auto w-full object-contain" />
          </div>
          <div className="space-y-2">
            <h2 className="text-[32px] font-semibold leading-[120%] text-slate-900">Welcome to BookStore Hub</h2>
            <p className="text-base font-medium leading-[120%] text-slate-500">
              Your all-in-one platform to manage your bookstore efficiently and grow your business.
            </p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" type="password" />
            </div>
            <Button type="submit" className="h-[51px] w-full text-base" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
