import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2E6FF3] focus:outline-none focus:ring-4 focus:ring-[#2E6FF3]/10",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
