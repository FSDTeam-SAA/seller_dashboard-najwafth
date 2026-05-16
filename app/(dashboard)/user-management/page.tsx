"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { PageFrame, SectionCard, StatusPill } from "@/components/seller/primitives";
import { Pagination } from "@/components/ui/pagination";
import { getSellerUsers } from "@/lib/api";
import { formatCurrency, formatDate, getAssetUrl, toCount } from "@/lib/utils";

type UserRow = {
  _id: string;
  name?: string;
  avatar?: { url?: string };
  image?: string;
  orderId?: string;
  createdAt?: string;
  lastOrderAt?: string;
  phone?: string;
  totalOrders?: number;
  totalBooks?: number;
  totalSpent?: number;
  status?: string;
  rating?: number;
};

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<{ users?: UserRow[]; meta?: { totalPage?: number; total?: number; limit?: number; page?: number } }>({
    queryKey: ["seller-users", page],
    queryFn: () => getSellerUsers({ page, limit: 10 }),
  });

  const users = data?.users || [];
  const total = data?.meta?.total || 0;
  const limit = data?.meta?.limit || 10;
  const currentPage = data?.meta?.page || page;
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <PageFrame title="User Management" subtitle="Manage users and access with ease">
      <SectionCard>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="text-[14px] text-[#5b6371]">
              <tr>
                <th className="py-3">User Name</th>
                <th className="py-3">Order ID</th>
                <th className="py-3">Date</th>
                <th className="py-3">Phone Number</th>
                <th className="py-3">Total Order</th>
                <th className="py-3">Price</th>
                <th className="py-3">Review</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={`loading-${index}`} className="border-t border-[#f0e7d4]">
                      <td className="py-3" colSpan={8}>
                        <div className="h-8 animate-pulse rounded bg-[#f6efe4]" />
                      </td>
                    </tr>
                  ))
                : users.map((user) => {
                const avatar = getAssetUrl(user.avatar || user.image);
                return (
                  <tr key={user._id} className="border-t border-[#f0e7d4]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 overflow-hidden rounded-full bg-[#d6c0aa]">
                          {avatar ? (
                            <Image src={avatar} alt={user.name || "User"} fill sizes="40px" className="object-cover" />
                          ) : null}
                        </div>
                        <span className="font-medium text-[#202124]">{user.name || "Customer"}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#5b6371]">{user.orderId || "-"}</td>
                    <td className="py-3 text-[#5b6371]">{formatDate(user.lastOrderAt || user.createdAt)}</td>
                    <td className="py-3 text-[#5b6371]">{user.phone || "-"}</td>
                    <td className="py-3 text-[#5b6371]">{toCount(user.totalBooks ?? user.totalOrders, 0)} books</td>
                    <td className="py-3 text-[#5b6371]">{formatCurrency(user.totalSpent || 0)}</td>
                    <td className="py-3 text-[#5b6371]">{typeof user.rating === "number" ? user.rating.toFixed(1) : "-"}</td>
                    <td className="py-3">
                      <StatusPill status={user.status || "pending"} />
                    </td>
                  </tr>
                );
              })}
              {!isLoading && users.length === 0 ? (
                <tr className="border-t border-[#f0e7d4]">
                  <td colSpan={8} className="py-10 text-center text-[14px] text-[#5b6371]">
                    No customers have ordered from you yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-[14px] text-[#5b6371]">
          <span>{total === 0 ? "No results" : `Showing ${start} to ${end} of ${total} results`}</span>
          <Pagination page={page} totalPages={data?.meta?.totalPage || 1} onPageChange={setPage} />
        </div>
      </SectionCard>
    </PageFrame>
  );
}
