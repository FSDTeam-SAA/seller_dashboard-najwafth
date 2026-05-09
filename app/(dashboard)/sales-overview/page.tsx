"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { BookOpen, MapPin, Plus, ShoppingCart, Star, Users } from "lucide-react";
import { useState } from "react";
import { MetricCard, PageFrame, PeriodTabs, SectionCard } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getSellerSales } from "@/lib/api";
import { formatCurrency, getAssetUrl } from "@/lib/utils";

type Book = {
  _id: string;
  title?: string;
  author?: string;
  price?: number;
  rating?: number;
  location?: string;
  image?: { url?: string };
  coverImage?: string;
  soldCount?: number;
};

type SalesResp = {
  metrics?: { totalRevenue?: number; completedOrders?: number; avgOrderValue?: number };
  analysis?: { label: string; value: number }[];
  topBooks?: Book[];
};

export default function SalesOverviewPage() {
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Week");
  const [page, setPage] = useState(1);
  const { data } = useQuery<SalesResp | undefined>({
    queryKey: ["seller-sales", period],
    queryFn: () => getSellerSales({ period: period.toLowerCase() as "week" | "month" | "year" }),
  });

  const metrics = data?.metrics || { totalRevenue: 262.39, completedOrders: 1700, avgOrderValue: 1700 };
  const sales = data?.analysis || [
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

  const topBooks = data?.topBooks || [];

  return (
    <PageFrame
      title="Sales Overview"
      subtitle="Monitor sales performance and revenue insights"
      action={
        <Button className="bg-[#103670] hover:bg-[#0d2856]">
          <Plus className="size-4" /> New Checklist
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Revenue" value={formatCurrency(metrics.totalRevenue ?? 262.39)} icon={<BookOpen className="size-5" />} iconBg="bg-[#3d8ef5]" iconColor="text-white" />
        <MetricCard label="Completed Orders" value={metrics.completedOrders ?? 1700} icon={<ShoppingCart className="size-5" />} iconBg="bg-[#3d8ef5]" iconColor="text-white" />
        <MetricCard label="Avg. Order Value" value={metrics.avgOrderValue ?? 1700} icon={<Users className="size-5" />} iconBg="bg-[#f87171]" iconColor="text-white" />
      </div>

      <SectionCard className="mt-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold text-[#202124]">Revenue Overview</h2>
            <p className="text-[14px] text-[#5b6371]">Revenue over the last 7 days</p>
          </div>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
        <div className="relative h-[260px] w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fe8a3b" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fe8a3b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="none" stroke="#fe8a3b" strokeWidth="0.6" points={points} />
            <polygon fill="url(#revFill)" points={`0,100 ${points} 100,100`} />
          </svg>
          <div className="mt-2 grid grid-cols-7 text-center text-[12px] text-[#5b6371]">
            {sales.map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mt-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">Top Selling Books</h2>
        <p className="text-[14px] text-[#5b6371]">Your most popular and frequently purchased titles</p>
        <div className="mt-4 grid grid-cols-2 px-3 text-[14px] font-medium text-[#5b6371]">
          <span>User Name</span>
          <span className="text-right">Sold Books</span>
        </div>
        <div className="mt-2 space-y-3">
          {(topBooks.length > 0 ? topBooks : Array.from({ length: 5 }).map((_, i) => ({ _id: String(i) } as Book))).map((book) => {
            const cover = getAssetUrl(book.image || book.coverImage);
            return (
              <div key={book._id} className="grid grid-cols-2 items-center gap-4 rounded-[12px] border border-[#e3e6ec] p-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-14 overflow-hidden rounded-[10px] bg-[#e3e6ec]">
                    {cover ? <Image src={cover} alt={book.title || ""} fill sizes="56px" className="object-cover" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] font-semibold text-[#202124]">{book.title || "Zero one"}</p>
                      <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#f59e0b]">
                        <Star className="size-3.5 fill-current" /> {(book.rating ?? 4.8).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#5b6371]">{book.author || "F. Scott Fitzgerald"}</p>
                    <div className="flex items-center justify-between text-[13px]">
                      <p className="flex items-center gap-1 text-[#5b6371]"><MapPin className="size-3.5 text-[#3d8ef5]" /> {book.location || "123 Library, Book City"}</p>
                      <p className="font-semibold text-[#3d8ef5]">{formatCurrency(book.price ?? 12.99)}</p>
                    </div>
                  </div>
                </div>
                <p className="text-right text-[14px] text-[#202124]">{book.soldCount ?? 4} Books</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-[14px] text-[#5b6371]">
          <span>Showing 1 to 12 of 20 results</span>
          <Pagination page={page} totalPages={20} onPageChange={setPage} />
        </div>
      </SectionCard>
    </PageFrame>
  );
}
