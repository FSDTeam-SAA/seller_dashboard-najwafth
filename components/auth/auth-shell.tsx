import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  bodyClassName?: string;
};

export function AuthShell({ title, description, children, bodyClassName }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f6ede2] px-6 py-10 text-[#22201c]">
      <div className={cn("mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[498px] flex-col justify-center", bodyClassName)}>
        <div className="mb-12 flex flex-col items-center text-center">
          <Image src="/assets/brand-mark.png" alt="Books on wheels" width={206} height={116} className="h-auto w-[160px] sm:w-[206px]" priority />
          {title || description ? (
            <div className="mt-8 space-y-2">
              {title ? <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-[#27231f]">{title}</h1> : null}
              {description ? <p className="text-[15px] font-normal text-[#9a948d]">{description}</p> : null}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
