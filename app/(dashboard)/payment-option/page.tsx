"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageFrame, SectionCard } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";

export default function PaymentOptionPage() {
  const [selected, setSelected] = useState<"stripe" | null>("stripe");

  return (
    <PageFrame title="Payment Option" subtitle="Manage your Payment Option">
      <SectionCard className="mx-auto max-w-[640px]">
        <h2 className="mt-6 text-center text-[24px] font-semibold text-[#202124]">Connect your account</h2>

        <button
          type="button"
          onClick={() => setSelected("stripe")}
          className="mt-6 flex w-full items-center justify-between rounded-[12px] border border-[#cfd4dc] bg-white px-5 py-4 text-left"
        >
          <span className="text-[24px] font-bold italic text-[#5b3df5]">stripe</span>
          <span
            className={`flex size-5 items-center justify-center rounded-full border-2 ${
              selected === "stripe" ? "border-[#3d8ef5]" : "border-[#cfd4dc]"
            }`}
          >
            {selected === "stripe" ? <span className="size-2.5 rounded-full bg-[#3d8ef5]" /> : null}
          </span>
        </button>

        <div className="mt-6 flex justify-center pb-6">
          <Button
            className="bg-[#6d98c0] px-10 hover:bg-[#5f88ae]"
            onClick={() => toast.info("Stripe Connect onboarding will start.")}
          >
            Connect
          </Button>
        </div>
      </SectionCard>
    </PageFrame>
  );
}
