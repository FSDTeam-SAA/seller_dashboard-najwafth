"use client";

import Image from "next/image";
import { Bell, ChevronDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { cn, getAssetUrl, timeAgo } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { getNotifications, getProfile, markAllNotificationsAsRead } from "@/lib/api";

const statusStyles: Record<string, string> = {
  pending: "bg-[#ffefad] text-[#c48b00]",
  processing: "bg-[#c9e7d3] text-[#16934b]",
  picked: "bg-[#fde2c9] text-[#cf6b1f]",
  delivered: "bg-[#d8e9ff] text-[#3d8ef5]",
  completed: "bg-[#c9e7d3] text-[#16934b]",
  cancelled: "bg-[#fde7e7] text-[#d92d20]",
  rejected: "bg-[#fde7e7] text-[#d92d20]",
};

export function getStatusPillTone(status?: string) {
  return statusStyles[(status || "pending").toLowerCase()] || "bg-[#eef2f7] text-slate-600";
}

export function StatusPill({ status, className }: { status?: string; className?: string }) {
  const normalized = (status || "pending").replaceAll("_", " ");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium capitalize",
        getStatusPillTone(normalized),
        className,
      )}
    >
      {normalized}
      <ChevronDown className="size-3.5" />
    </span>
  );
}

export function PageFrame({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-[calc(100vh-104px)] bg-[#f7eddd] px-6 py-7 md:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-[120%] text-[#202124]">{title}</h1>
          <p className="mt-2 text-[16px] font-medium leading-[120%] text-[#313131]">{subtitle}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <Card className="flex items-center justify-between rounded-[14px] border-[#e3e6ec] bg-white p-5 shadow-none">
      <div>
        <p className="text-[24px] font-semibold text-[#202124]">{value}</p>
        <p className="mt-2 text-[16px] text-[#5b6371]">{label}</p>
      </div>
      {icon ? (
        <div
          className={cn("flex size-12 items-center justify-center rounded-full", iconBg || "bg-[#3d8ef5]/10", iconColor || "text-[#3d8ef5]")}
        >
          {icon}
        </div>
      ) : null}
    </Card>
  );
}

type NotificationItem = {
  _id: string;
  title?: string;
  message?: string;
  type?: string;
  createdAt?: string;
  read?: boolean;
  meta?: Record<string, unknown>;
};

export function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"all" | "order" | "driver" | "review">("all");

  const { data, refetch } = useQuery({
    queryKey: ["seller-notifications"],
    queryFn: () => getNotifications(1, 20),
    enabled: open,
  });

  const list = ((data as { notifications?: NotificationItem[] } | NotificationItem[] | undefined) || []);
  const items: NotificationItem[] = Array.isArray(list) ? list : list?.notifications || [];

  const tabs = [
    { id: "all", label: "All" },
    { id: "order", label: "New Order" },
    { id: "driver", label: "New driver" },
    { id: "review", label: "New Review" },
  ] as const;

  const filtered = tab === "all" ? items : items.filter((item) => (item.type || "").toLowerCase().includes(tab));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-[480px] flex-col bg-[#fcf1e2] p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[24px] font-semibold text-[#202124]">Notification Management</h2>
            <p className="mt-1 text-[14px] text-[#5b6371]">See all notification</p>
          </div>
          <button onClick={onClose} type="button" className="text-[#5b6371]">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-5 flex-1 overflow-y-auto rounded-[16px] bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex flex-wrap gap-2">
              {tabs.map((entry) => (
                <button
                  key={entry.id}
                  className={cn(
                    "rounded-[8px] px-3 py-1.5 text-[14px] font-medium transition",
                    tab === entry.id ? "bg-[#252525] text-white" : "text-[#5b6371] hover:bg-[#f3f4f6]",
                  )}
                  onClick={() => setTab(entry.id)}
                  type="button"
                >
                  {entry.label}
                </button>
              ))}
            </div>
            <button
              className="rounded-[10px] bg-[#6d98c0] px-4 py-2 text-[14px] font-medium text-white"
              onClick={async () => {
                await markAllNotificationsAsRead();
                refetch();
              }}
              type="button"
            >
              Mark as all Read
            </button>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-[14px] text-[#5b6371]">No notifications</p>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className={cn("rounded-[12px] p-4", item.read ? "bg-white" : "bg-[#edf5ff]")}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-[#16934b] text-white">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                        <path fillRule="evenodd" d="M16.704 5.295a1 1 0 0 1 0 1.41l-7.5 7.5a1 1 0 0 1-1.41 0l-3.5-3.5a1 1 0 1 1 1.41-1.41L8.5 12.085l6.795-6.79a1 1 0 0 1 1.41 0Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-semibold text-[#202124]">{item.title || "Notification"}</h3>
                      {item.message ? <p className="mt-1 text-[14px] text-[#5b6371]">{item.message}</p> : null}
                      <p className="mt-2 text-[12px] text-[#9aa1ad]">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderBar() {
  const [openNotifications, setOpenNotifications] = useState(false);

  const { data: profile } = useQuery<{
    name?: string;
    avatar?: { url?: string };
    image?: string;
    role?: string;
  }>({
    queryKey: ["seller-profile"],
    queryFn: getProfile,
    staleTime: 60_000,
  });

  const { data: notif } = useQuery({
    queryKey: ["seller-notifications-badge"],
    queryFn: () => getNotifications(1, 1),
    refetchInterval: 60_000,
  });

  const unreadCount =
    (notif as { unreadCount?: number; meta?: { unread?: number } } | undefined)?.unreadCount ??
    (notif as { meta?: { unread?: number } } | undefined)?.meta?.unread ??
    0;

  const profileName = profile?.name || "Rani";
  const avatar = getAssetUrl(profile?.avatar || profile?.image);

  return (
    <>
      <header className="flex items-center justify-end gap-4 bg-[#fcf1e2] px-6 py-4 md:px-8">
        <button
          className="relative text-[#252525]"
          onClick={() => setOpenNotifications(true)}
          type="button"
          aria-label="Open notifications"
        >
          <Bell className="size-6" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d92d20] px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
        <div className="flex items-center gap-3">
          <div className="relative size-11 overflow-hidden rounded-full bg-[#d6c0aa]">
            {avatar ? (
              <Image src={avatar} alt={profileName} fill sizes="44px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
                {profileName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="text-[16px] font-semibold leading-[120%] text-[#202124]">{profileName}</p>
            <p className="text-[14px] leading-[120%] text-[#5b6371]">@{profile?.role || "Admin"}</p>
          </div>
        </div>
      </header>
      <NotificationDrawer open={openNotifications} onClose={() => setOpenNotifications(false)} />
    </>
  );
}

export function SectionCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <Card className={cn("rounded-[18px] border-[#e3e6ec] bg-white p-5 shadow-none", className)}>{children}</Card>;
}

export function PeriodTabs({
  value,
  onChange,
}: {
  value: "Week" | "Month" | "Year";
  onChange: (v: "Week" | "Month" | "Year") => void;
}) {
  const items = ["Week", "Month", "Year"] as const;
  return (
    <div className="inline-flex rounded-[10px] border border-[#e3e6ec] bg-white p-1">
      {items.map((item) => (
        <button
          key={item}
          className={cn(
            "rounded-[8px] px-5 py-1.5 text-[14px] font-medium transition",
            value === item ? "bg-[#6d98c0] text-white" : "text-[#5b6371]",
          )}
          onClick={() => onChange(item)}
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className={cn("max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-[16px] bg-white p-6", className)}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="mb-5 flex items-start justify-between">
      <div>
        <h2 className="text-[22px] font-semibold text-[#202124]">{title}</h2>
        {subtitle ? <p className="mt-1 text-[14px] text-[#5b6371]">{subtitle}</p> : null}
      </div>
      <button onClick={onClose} type="button" className="text-[#5b6371]">
        <X className="size-5" />
      </button>
    </div>
  );
}
