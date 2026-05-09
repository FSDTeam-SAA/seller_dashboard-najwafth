"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, MapPin, Phone, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal, PageFrame, SectionCard, StatusPill } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getOrderById, getSellerOrders, updateOrderStatus } from "@/lib/api";
import { cn, formatCurrency, formatDate, toText } from "@/lib/utils";

type Order = {
  _id: string;
  orderId?: string;
  createdAt?: string;
  totalAmount?: number;
  subtotal?: number;
  deliveryFee?: number;
  status?: string;
  paymentMethod?: string;
  customer?: { name?: string; phone?: string; email?: string; address?: string };
  email?: string;
  phone?: string;
  items?: { _id?: string; name?: string }[];
  rating?: number;
};

type OrdersResponse = {
  orders?: Order[];
  pagination?: { totalPages: number };
};

const tabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "picked", label: "Picked" },
  { id: "delivered", label: "Delivered" },
] as const;

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<string | null>(null);

  const { data } = useQuery<OrdersResponse>({
    queryKey: ["seller-orders", page, tab],
    queryFn: () => getSellerOrders({ page, limit: 12, status: tab === "all" ? undefined : tab }),
  });
  const orders = data?.orders || [];

  const orderQuery = useQuery<Order>({
    queryKey: ["seller-order", viewing],
    queryFn: () => getOrderById(viewing!),
    enabled: !!viewing,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderStatus(id, { status }),
    onSuccess: () => {
      toast.success("Order status updated.");
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-order"] });
    },
  });

  return (
    <PageFrame title="Orders Management" subtitle="Track and manage customer orders">
      <SectionCard>
        <div className="mb-5 inline-flex flex-wrap rounded-[10px] bg-[#1f1f1f] p-1">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              className={cn(
                "rounded-[8px] px-5 py-1.5 text-[14px] font-medium transition",
                tab === entry.id ? "bg-[#6d98c0] text-white" : "text-white/70 hover:text-white",
              )}
              onClick={() => setTab(entry.id)}
              type="button"
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="text-[14px] text-[#5b6371]">
              <tr>
                <th className="py-3">Order ID</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-center">Email</th>
                <th className="py-3">Phone Number</th>
                <th className="py-3">Total Order</th>
                <th className="py-3">Price</th>
                <th className="py-3">Review</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(orders.length > 0 ? orders : Array.from({ length: 7 }).map((_, i) => ({ _id: String(i) } as Order))).map((order) => (
                <tr key={order._id} className="border-t border-[#f0e7d4]">
                  <td className="py-3 text-[#202124]">{toText(order.orderId, "ORD-9102")}</td>
                  <td className="py-3 text-[#5b6371]">
                    <p>{order.createdAt ? formatDate(order.createdAt) : "4/8/2026"}</p>
                    <p className="text-[12px]">09:29 AM</p>
                  </td>
                  <td className="py-3 text-center text-[#5b6371]">{toText(order.customer?.email || order.email, "tim.jennings@example.com")}</td>
                  <td className="py-3 text-[#5b6371]">{toText(order.customer?.phone || order.phone, "(207) 555-0119")}</td>
                  <td className="py-3 text-[#5b6371]">{order.items?.length || 4} books</td>
                  <td className="py-3 text-[#202124]">{formatCurrency(order.totalAmount || 19.99)}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-0.5 text-[#f59e0b]">
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
                    <StatusPill status={order.status || "pending"} />
                  </td>
                  <td className="py-3 text-right">
                    <Button className="bg-[#3d8ef5] hover:bg-[#2f7be0]" onClick={() => setViewing(order._id)}>
                      View <Eye className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-[14px] text-[#5b6371]">
          <span>Showing 1 to 12 of 20 results</span>
          <Pagination page={page} totalPages={data?.pagination?.totalPages || 20} onPageChange={setPage} />
        </div>
      </SectionCard>

      <Modal open={!!viewing} onClose={() => setViewing(null)} className="max-w-[640px]">
        {orderQuery.data ? (
          (() => {
            const o = orderQuery.data;
            const status = (o.status || "pending").toLowerCase();
            return (
              <>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="flex items-center gap-3 text-[22px] font-semibold text-[#202124]">
                      Order {o.orderId || o._id} <StatusPill status={status} />
                    </h2>
                    <p className="mt-1 text-[14px] text-[#5b6371]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                  <button onClick={() => setViewing(null)} type="button" className="text-[#5b6371]">
                    <X className="size-5" />
                  </button>
                </div>
                <div className="mb-5 flex justify-end">
                  {status === "pending" ? (
                    <Button
                      className="bg-[#3d8ef5] hover:bg-[#2f7be0]"
                      onClick={() => statusMutation.mutate({ id: o._id, status: "processing" })}
                    >
                      <ShieldCheck className="size-4" /> Mark as Ready
                    </Button>
                  ) : status !== "delivered" ? (
                    <Button
                      className="bg-[#16934b] hover:bg-[#137a3d]"
                      onClick={() => statusMutation.mutate({ id: o._id, status: "delivered" })}
                    >
                      <ShieldCheck className="size-4" /> Mark as Delivered
                    </Button>
                  ) : null}
                </div>

                <SectionCard className="mb-4 border border-[#e3e6ec]">
                  <h3 className="flex items-center gap-2 text-[16px] font-semibold text-[#3d8ef5]">
                    <User className="size-5" /> Customer Details
                  </h3>
                  <div className="mt-3 space-y-2 text-[14px] text-[#202124]">
                    <p className="flex items-center gap-2"><User className="size-4 text-[#5b6371]" /> Name: <span className="font-semibold">{o.customer?.name || "Bob Smith"}</span></p>
                    <p className="flex items-center gap-2"><Phone className="size-4 text-[#5b6371]" /> Phone Number: <span className="font-semibold">{o.customer?.phone || "555-0102"}</span></p>
                    <p className="flex items-center gap-2"><MapPin className="size-4 text-[#5b6371]" /> Delivery Address: <span className="font-semibold">{o.customer?.address || "456 Oak Ave, Townsburg"}</span></p>
                  </div>
                </SectionCard>

                <SectionCard className="border border-[#e3e6ec]">
                  <h3 className="flex items-center gap-2 text-[16px] font-semibold text-[#3d8ef5]">
                    <ShoppingBag className="size-5" /> Order Items Summary
                  </h3>
                  <div className="mt-3 space-y-2 text-[14px]">
                    <div className="flex justify-between"><span>Payment Method:</span><span className="font-semibold">{o.paymentMethod || "Stripe"}</span></div>
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(o.subtotal ?? 51.96)}</span></div>
                    <div className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(o.deliveryFee ?? 2)}</span></div>
                    <div className="flex justify-between border-t border-[#e3e6ec] pt-2 text-[16px] font-semibold">
                      <span>Total</span>
                      <span className="text-[#3d8ef5]">{formatCurrency(o.totalAmount ?? 53.96)}</span>
                    </div>
                  </div>
                </SectionCard>
              </>
            );
          })()
        ) : (
          <div className="py-12 text-center text-[#5b6371]">Loading...</div>
        )}
      </Modal>
    </PageFrame>
  );
}
