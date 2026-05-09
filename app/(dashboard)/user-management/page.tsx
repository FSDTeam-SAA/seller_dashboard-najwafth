"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { PageFrame, SectionCard, StatusPill } from "@/components/seller/primitives";
import { Pagination } from "@/components/ui/pagination";
import { getSellerUsers } from "@/lib/api";
import { formatCurrency, formatDate, getAssetUrl, toCount, toText } from "@/lib/utils";

type UserRow = {
  _id: string;
  name?: string;
  avatar?: { url?: string };
  image?: string;
  orderId?: string;
  createdAt?: string;
  phone?: string;
  totalOrders?: number;
  totalSpent?: number;
  status?: string;
  rating?: number;
};

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const { data } = useQuery<{ users?: UserRow[]; meta?: { totalPage?: number } }>({
    queryKey: ["seller-users", page],
    queryFn: () => getSellerUsers({ page, limit: 10 }),
  });

  const users = data?.users || [];

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
              {(users.length > 0 ? users : Array.from({ length: 10 }).map((_, i) => ({ _id: String(i) } as UserRow))).map((user) => {
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
                        <span className="font-medium text-[#202124]">{user.name || "Najwafth"}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#5b6371]">{toText(user.orderId, "ORD-9102")}</td>
                    <td className="py-3 text-[#5b6371]">{user.createdAt ? formatDate(user.createdAt) : "4/8/2026"}</td>
                    <td className="py-3 text-[#5b6371]">{toText(user.phone, "(207) 555-0119")}</td>
                    <td className="py-3 text-[#5b6371]">{toCount(user.totalOrders, 4)} books</td>
                    <td className="py-3 text-[#5b6371]">{formatCurrency(user.totalSpent || 19.99)}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[#f59e0b]">
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <svg key={idx} viewBox="0 0 20 20" fill="currentColor" className="size-4">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118L10 15.347l-3.954 2.677c-.785.57-1.84-.196-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958Z" />
                          </svg>
                        ))}
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 0 0-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118L10 15.347l-3.954 2.677c-.785.57-1.84-.196-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.958Z" />
                        </svg>
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusPill status={user.status || ["pending", "completed", "picked", "delivered"][Math.floor(Math.random() * 4)]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-[14px] text-[#5b6371]">
          <span>Showing 1 to 12 of 20 results</span>
          <Pagination page={page} totalPages={data?.meta?.totalPage || 20} onPageChange={setPage} />
        </div>
      </SectionCard>
    </PageFrame>
  );
}
