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
  const metrics = data?.metrics || { total: 0, positive: 0, negative: 0 };
  const sales = data?.analysis || [];
  const max = Math.max(...sales.map((p) => p.value), 1);
  const points = sales.map((p, i) => `${(i / (sales.length - 1)) * 100},${100 - (p.value / max) * 90}`).join(" ");

  return (
    <PageFrame title="Review Management" subtitle="View, manage customer reviews.">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Review" value={metrics.total ?? 0} icon={<BookOpen className="size-5" />} iconBg="bg-[#6d98c0]" iconColor="text-white" />
        <MetricCard label="Total Positive Review" value={metrics.positive ?? 0} icon={<BookOpen className="size-5" />} iconBg="bg-[#16934b]" iconColor="text-white" />
        <MetricCard label="Total Negative Review" value={metrics.negative ?? 0} icon={<BookOpen className="size-5" />} iconBg="bg-[#d92d20]" iconColor="text-white" />
      </div>

      <SectionCard className="mt-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold text-[#202124]">Review Analysis</h2>
            <p className="text-[14px] text-[#5b6371]">Review Analysis over the last 7 days</p>
          </div>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
        {sales.length > 0 ? (
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
        ) : (
          <div className="flex h-[260px] items-center justify-center rounded-[16px] border border-dashed border-[#e3e6ec] text-[14px] text-[#5b6371]">
            Review analytics are not available yet
          </div>
        )}
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
          {reviews.map((review) => {
            const avatar = getAssetUrl(review.customer?.avatar || review.customer?.image);
            return (
              <div key={review._id} className="rounded-[12px] border border-[#e3e6ec] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative size-9 overflow-hidden rounded-full bg-[#d6c0aa]">
                      {avatar ? <Image src={avatar} alt={review.customer?.name || ""} fill sizes="36px" className="object-cover" /> : null}
                    </div>
                    <span className="text-[15px] font-semibold text-[#202124]">{review.customer?.name || "Anonymous"}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#f59e0b]">
                    <Star className="size-4 fill-current" /> {(review.rating ?? 5).toFixed(1)}
                  </span>
                </div>
                <p className="mt-3 text-[14px] leading-[1.5] text-[#5b6371]">
                  {review.comment || "No comment provided."}
                </p>
                <div className="mt-4 flex items-center justify-between text-[12px]">
                  <span className="text-[#3d8ef5] font-medium">{toText(review.orderId, "N/A")}</span>
                  <span className="text-[#9aa1ad]">{review.createdAt ? timeAgo(review.createdAt) : "N/A"}</span>
                </div>
              </div>
            );
          })}
          {reviews.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#e3e6ec] p-10 text-center text-[14px] text-[#5b6371]">
              No reviews yet
            </div>
          ) : null}
        </div>
      </SectionCard>
    </PageFrame>
  );
}
