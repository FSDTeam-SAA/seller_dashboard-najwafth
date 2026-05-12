import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: LucideIcon;
  rightSlot?: ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
};

export function AuthField({
  label,
  icon: Icon,
  rightSlot,
  wrapperClassName,
  inputClassName,
  ...props
}: AuthFieldProps) {
  return (
    <label className={cn("block space-y-2.5", wrapperClassName)}>
      <span className="block text-[16px] font-semibold leading-none text-[#1f1b18]">{label}</span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8d877f]" />
        <Input
          className={cn(
            "h-[50px] rounded-[8px] border-[#c7c0b8] bg-transparent pl-11 text-[15px] text-[#2d2925] placeholder:text-[#918b83] focus:border-[#7098c0] focus:ring-0",
            rightSlot ? "pr-11" : "pr-4",
            inputClassName,
          )}
          {...props}
        />
        {rightSlot ? <span className="absolute inset-y-0 right-4 flex items-center">{rightSlot}</span> : null}
      </span>
    </label>
  );
}
