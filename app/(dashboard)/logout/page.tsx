"use client";

import { LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageFrame } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <PageFrame title="Logout" subtitle="Logout of your account">
      <div className="rounded-[16px] border border-[#e3e6ec] bg-white p-10 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[16px] bg-[#fde7e7]">
          <Shield className="size-9 text-[#d92d20]" />
        </div>
        <h2 className="mt-6 text-[28px] font-semibold text-[#202124]">Are you sure to log out?</h2>
        <p className="mt-2 text-[16px] text-[#5b6371]">You will need to log back in to access your dashboard.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" className="border-[#3d8ef5] text-[#3d8ef5]" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            className="bg-[#6d98c0] hover:bg-[#5f88ae]"
            disabled={pending}
            onClick={() => {
              setPending(true);
              signOut({ callbackUrl: "/auth/signin" });
            }}
          >
            Logout <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </PageFrame>
  );
}
