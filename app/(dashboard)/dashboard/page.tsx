"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChartNoAxesCombined, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MetricCard, PageFrame, PeriodTabs, SectionCard, StatusPill } from "@/components/seller/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, toCount, toText } from "@/lib/utils";
import { getSellerOverview } from "@/lib/api";

type RecentOrder = {
  _id: string;
  orderId?: string;
  createdAt?: string;
  totalAmount?: number;
  price?: number;
  status?: string;
  items?: unknown[];
  totalOrder?: number;
  customer?: { name?: string; phone?: string };
};

type Overview = {
  metrics?: {
    totalBooks?: number;
    totalOrders?: number;
    totalUsers?: number;
    totalCompletedOrders?: number;
    totalRevenue?: number;
  };
  salesAnalysis?: { label: string; value: number }[];
  recentOrders?: RecentOrder[];
  recentUsers?: RecentOrder[];
};

export default function SellerDashboardPage() {
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Week");
  const { data, isLoading } = useQuery<Overview>({ queryKey: ["seller-overview"], queryFn: getSellerOverview });

  const overview = data || {};
  const metrics = overview.metrics || {};
  const recent = overview.recentOrders || overview.recentUsers || [];

  const sales = overview.salesAnalysis || [
    { label: "Mon", value: 120 },
    { label: "Tue", value: 220 },
    { label: "Wed", value: 200 },
    { label: "Thu", value: 280 },
    { label: "Fri", value: 360 },
    { label: "Sat", value: 470 },
    { label: "Sun", value: 410 },
  ];
  const max = Math.max(...sales.map((p) => p.value), 1);
  const points = sales.map((p, i) => `${(i / (sales.length - 1)) * 100},${100 - (p.value / max) * 90}`).join(" ");

  return (
    <PageFrame title="Dashboard" subtitle="Welcome back to your Seller Dashboard">
      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total Books" value={metrics.totalBooks ?? 520} icon={<BookOpen className="size-5" />} iconBg="bg-[#3d8ef5]" iconColor="text-white" />
          <MetricCard label="Total Orders" value={metrics.totalOrders ?? 1700} icon={<ShoppingCart className="size-5" />} iconBg="bg-[#3d8ef5]" iconColor="text-white" />
          <MetricCard label="Total User" value={metrics.totalUsers ?? 1700} icon={<Users className="size-5" />} iconBg="bg-[#f87171]" iconColor="text-white" />
          <MetricCard label="Total Completed Orders" value={metrics.totalCompletedOrders ?? 552} icon={<ShoppingCart className="size-5" />} iconBg="bg-[#16934b]" iconColor="text-white" />
          <MetricCard label="Total Revenue" value={formatCurrency(metrics.totalRevenue ?? 262.39)} icon={<ChartNoAxesCombined className="size-5" />} iconBg="bg-[#fe8a3b]" iconColor="text-white" />
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard>
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[20px] font-semibold text-[#202124]">Sales Analysis</h2>
              <p className="text-[14px] text-[#5b6371]">Revenue over the last 7 days</p>
            </div>
            <PeriodTabs value={period} onChange={setPeriod} />
          </div>
          <div className="relative h-[260px] w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fe8a3b" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#fe8a3b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline fill="none" stroke="#fe8a3b" strokeWidth="0.6" points={points} />
              <polygon fill="url(#chartFill)" points={`0,100 ${points} 100,100`} />
            </svg>
            <div className="mt-2 grid grid-cols-7 text-center text-[12px] text-[#5b6371]">
              {sales.map((p) => (
                <span key={p.label}>{p.label}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <h2 className="text-[20px] font-semibold text-[#202124]">Quick Actions</h2>
          <p className="text-[14px] text-[#5b6371]">Tap to get help now</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/books" className="rounded-[14px] bg-[#dbe8ff] p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#3d8ef5] text-white">
                <BookOpen className="size-5" />
              </div>
              <p className="mt-3 text-[20px] font-semibold text-[#202124]">{metrics.totalBooks ?? 520}</p>
              <p className="text-[14px] text-[#3d8ef5]">Add New Book</p>
            </Link>
            <Link href="/orders" className="rounded-[14px] bg-[#d8f1e0] p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#16934b] text-white">
                <ShoppingCart className="size-5" />
              </div>
              <p className="mt-3 text-[20px] font-semibold text-[#202124]">{metrics.totalOrders ?? 1700}</p>
              <p className="text-[14px] text-[#16934b]">View Orders</p>
            </Link>
            <Link href="/sales-overview" className="rounded-[14px] bg-[#fde2c9] p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#fe8a3b] text-white">
                <ChartNoAxesCombined className="size-5" />
              </div>
              <p className="mt-3 text-[20px] font-semibold text-[#202124]">{metrics.totalOrders ?? 1700}</p>
              <p className="text-[14px] text-[#fe8a3b]">Check Sales</p>
            </Link>
            <Link href="/user-management" className="rounded-[14px] bg-[#fde7e7] p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#f87171] text-white">
                <Users className="size-5" />
              </div>
              <p className="mt-3 text-[20px] font-semibold text-[#202124]">{metrics.totalUsers ?? 520}</p>
              <p className="text-[14px] text-[#f87171]">Total User</p>
            </Link>
          </div>
        </SectionCard>
      </div>

      <SectionCard className="mt-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">Recent Users</h2>
        <p className="text-[14px] text-[#5b6371]">Total recent users</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="text-[14px] text-[#5b6371]">
              <tr>
                <th className="py-3">User Name</th>
                <th className="py-3">Order ID</th>
                <th className="py-3">Date</th>
                <th className="py-3">Phone Number</th>
                <th className="py-3">Total Order</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {(recent.length > 0 ? recent : Array.from({ length: 5 }).map((_, i) => ({ _id: String(i) } as RecentOrder))).map((order) => (
                <tr key={order._id} className="border-t border-[#f0e7d4]">
                  <td className="py-3 font-medium text-[#202124]">{toText(order.customer?.name, "Najwafth")}</td>
                  <td className="py-3 text-[#5b6371]">{toText(order.orderId, "ORD-9102")}</td>
                  <td className="py-3 text-[#5b6371]">{order.createdAt ? formatDate(order.createdAt) : "4/8/2026"}</td>
                  <td className="py-3 text-[#5b6371]">{toText(order.customer?.phone, "(207) 555-0119")}</td>
                  <td className="py-3 text-[#5b6371]">{toCount(order.totalOrder ?? order.items, 4)} books</td>
                  <td className="py-3">
                    <StatusPill status={order.status || "pending"} />
                  </td>
                  <td className="py-3 text-right font-semibold text-[#202124]">{formatCurrency(order.totalAmount || order.price || 19.99)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </PageFrame>
  );
}
