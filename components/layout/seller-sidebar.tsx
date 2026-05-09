"use client";

import Image from "next/image";
import {
  BookOpen,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user-management", label: "User Management", icon: Users },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/driver", label: "Driver", icon: Truck },
  { href: "/review", label: "Review", icon: MessageSquare },
  { href: "/sales-overview", label: "Sales Overview", icon: ChartNoAxesCombined },
  { href: "/store-profile", label: "Store Profile", icon: Store },
  { href: "/payment-option", label: "Payment Option", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

function matchRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#fcf1e2] px-6 py-8">
      <div className="flex flex-col items-center">
        <Image src="/assets/brand-mark.png" alt="Books on wheels" width={160} height={120} className="h-auto w-[150px]" />
      </div>
      <nav className="mt-10 flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = matchRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-4 py-3 text-[16px] font-medium transition",
                isActive ? "bg-[#6d98c0] text-white" : "text-[#252525] hover:bg-white/60",
              )}
              onClick={onClose}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/logout"
        className={cn(
          "flex items-center gap-3 rounded-[10px] px-4 py-3 text-[16px] font-medium transition",
          matchRoute(pathname, "/logout") ? "bg-[#6d98c0] text-white" : "text-[#252525] hover:bg-white/60",
        )}
        onClick={onClose}
      >
        <LogOut className="size-5" />
        Logout
      </Link>
    </div>
  );
}

export function SellerSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 rounded-[10px] bg-[#6d98c0] p-3 text-white shadow-lg lg:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu className="size-5" />
      </button>
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 overflow-y-auto lg:block">
        <SidebarContent />
      </aside>
      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="relative h-full w-[280px]">
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-[#252525]"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onClose={() => setIsOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
