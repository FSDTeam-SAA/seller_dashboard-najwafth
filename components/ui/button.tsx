import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-2xl text-sm font-medium transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E6FF3]/40",
  {
    variants: {
      variant: {
        default: "bg-[#2E6FF3] text-white hover:bg-[#1f5bd0]",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        outline: "border border-[#3d8ef5] bg-white text-[#3d8ef5] hover:bg-[#eaf4ff]",
        ghost: "text-slate-700 hover:bg-slate-100",
        destructive: "bg-[#d92d20] text-white hover:bg-[#b42318]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 rounded-xl",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);

Button.displayName = "Button";

export { Button, buttonVariants };
