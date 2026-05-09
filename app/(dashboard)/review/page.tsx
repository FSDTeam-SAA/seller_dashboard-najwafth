"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { useState } from "react";
import { MetricCard, PageFrame, PeriodTabs, SectionCard } from "@/components/seller/primitives";
import { getSellerReviews } from "@/lib/api";
import { getAssetUrl, timeAgo, toText } from "@/lib/utils";

type Review = {
  _id: string;
  customer?: { name?: string; image?: string; avatar?: { url?: string } };
  rating?: number;
  comment?: string;
  orderId?: string;
  createdAt?: string;
};

type ReviewResp = {
  reviews?: Review[];
  metrics?: { total?: number; positive?: number; negative?: number };
  analysis?: { label: string; value: number }[];
};

export default function ReviewPage() {
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Week");
  const { data } = useQuery<ReviewResp>({
    queryKey: ["seller-reviews"],
    queryFn: () => getSellerReviews({ page: 1, limit: 20 }),
  });

  const reviews = data?.reviews || [];
  const metrics = data?.metrics || { total: 1700, positive: 1700, negative: 1700 };
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

  return (
    <PageFrame title="Review Management" subtitle="View, manage customer reviews.">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Review" value={metrics.total ?? 1700} icon={<BookOpen className="size-5" />} iconBg="bg-[#6d98c0]" iconColor="text-white" />
        <MetricCard label="Total Positive Review" value={metrics.positive ?? 1700} icon={<BookOpen className="size-5" />} iconBg="bg-[#16934b]" iconColor="text-white" />
        <MetricCard label="Total Negative Review" value={metrics.negative ?? 1700} icon={<BookOpen className="size-5" />} iconBg="bg-[#d92d20]" iconColor="text-white" />
      </div>

      <SectionCard className="mt-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold text-[#202124]">Review Analysis</h2>
            <p className="text-[14px] text-[#5b6371]">Review Analysis over the last 7 days</p>
          </div>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
        <div className="relative h-[260px] w-full">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id="reviewFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3d8ef5" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3d8ef5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="none" stroke="#3d8ef5" strokeWidth="0.6" points={points} />
            <polygon fill="url(#reviewFill)" points={`0,100 ${points} 100,100`} />
          </svg>
          <div className="mt-2 grid grid-cols-7 text-center text-[12px] text-[#5b6371]">
            {sales.map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mt-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-[#202124]">Top Review</h2>
            <p className="text-[14px] text-[#5b6371]">Highest-rated reviews from customers across recent orders</p>
          </div>
          <Link href="/review" className="text-[14px] font-medium text-[#3d8ef5]">
            See all Review
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(reviews.length > 0 ? reviews : Array.from({ length: 6 }).map((_, i) => ({ _id: String(i) } as Review))).map((review) => {
            const avatar = getAssetUrl(review.customer?.avatar || review.customer?.image);
            return (
              <div key={review._id} className="rounded-[12px] border border-[#e3e6ec] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative size-9 overflow-hidden rounded-full bg-[#d6c0aa]">
                      {avatar ? <Image src={avatar} alt={review.customer?.name || ""} fill sizes="36px" className="object-cover" /> : null}
                    </div>
                    <span className="text-[15px] font-semibold text-[#202124]">{review.customer?.name || "Madiha Aroa"}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#f59e0b]">
                    <Star className="size-4 fill-current" /> {(review.rating ?? 5).toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 text-[14px] leading-[1.5] text-[#5b6371]">
                  {review.comment ||
                    "I've reviewed the Seller Dashboard and Driver List flow, and overall the structure looks very clean and well-organized. The logic of keeping driver assignment under admin control is absolutely correct for an MVP and ensures better system stability."}
                </p>
                <div className="mt-4 flex items-center justify-between text-[12px]">
                  <span className="text-[#3d8ef5] font-medium">{toText(review.orderId, "ORD-9102")}</span>
                  <span className="text-[#9aa1ad]">{review.createdAt ? timeAgo(review.createdAt) : "2 hours ago"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </PageFrame>
  );
}
