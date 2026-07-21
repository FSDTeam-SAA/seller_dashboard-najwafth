"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, Eye, MapPin, Phone, ShoppingBag, Truck, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal, PageFrame, SectionCard } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getOrderById, getSellerOrders, updateOrderStatus } from "@/lib/api";
import { cn, formatCurrency, formatDate, toText } from "@/lib/utils";

type Order = {
  _id: string;
  orderId?: string;
  createdAt?: string;
  address?: string;
  totalAmount?: number;
  subtotal?: number;
  deliveryFee?: number;
  shippingFee?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  payment?: { paymentMethod?: string; paymentStatus?: string; transactionId?: string; price?: number } | null;
  adminCommission?: number;
  adminCommissionRate?: number;
  customer?: { name?: string; phone?: string; email?: string; address?: string };
  email?: string;
  phone?: string;
  items?: { _id?: string; name?: string }[];
  rating?: number;
};

type OrdersResponse = {
  orders?: Order[];
  pagination?: { total: number; page: number; totalPages: number };
};

const tabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "picked", label: "Picked" },
  { id: "delivered", label: "Delivered" },
] as const;

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "picked", label: "Picked" },
  { value: "delivered", label: "Delivered" },
] as const;

const statusSteps = [
  { value: "pending", label: "Pending", description: "Order received by store" },
  { value: "processing", label: "Processing", description: "Store is preparing your order" },
  { value: "picked", label: "Picked", description: "Delivery partner picked up order" },
  { value: "delivered", label: "Delivered", description: "Order delivered successfully" },
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

  const handleStatusChange = (id: string, currentStatus: string | undefined, nextStatus: string) => {
    if (!id || !nextStatus || currentStatus === nextStatus) return;
    statusMutation.mutate({ id, status: nextStatus });
  };

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
                <th className="py-3">Admin Commission</th>
                <th className="py-3">Review</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-[#f0e7d4]">
                  <td className="py-3 text-[#202124]">{toText(order.orderId, "N/A")}</td>
                  <td className="py-3 text-[#5b6371]">
                    <p>{order.createdAt ? formatDate(order.createdAt) : "N/A"}</p>
                    <p className="text-[12px]">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                  </td>
                  <td className="py-3 text-center text-[#5b6371]">{toText(order.customer?.email || order.email, "N/A")}</td>
                  <td className="py-3 text-[#5b6371]">{toText(order.customer?.phone || order.phone, "N/A")}</td>
                  <td className="py-3 text-[#5b6371]">{order.items?.length || 0} books</td>
                  <td className="py-3 text-[#202124]">{formatCurrency(order.totalAmount || 0)}</td>
                  <td className="py-3 text-[#202124]">
                    <p>{order.adminCommissionRate ?? 0}%</p>
                    <p className="text-[12px] text-[#5b6371]">{formatCurrency(order.adminCommission ?? 0)}</p>
                  </td>
                  <td className="py-3">
                    <span className="text-[#5b6371]">-</span>
                  </td>
                  <td className="py-3">
                    <select
                      value={order.status || "pending"}
                      onChange={(event) => handleStatusChange(order.orderId || order._id, order.status || "pending", event.target.value)}
                      disabled={statusMutation.isPending}
                      className="h-9 rounded-full border border-[#cfe1f8] bg-[#d8e9ff] px-3 text-[13px] font-medium capitalize text-[#3d8ef5] outline-none disabled:opacity-60"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <Button className="bg-[#3d8ef5] hover:bg-[#2f7be0]" onClick={() => setViewing(order.orderId || order._id)}>
                      View <Eye className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 ? (
                <tr className="border-t border-[#f0e7d4]">
                  <td colSpan={10} className="py-8 text-center text-[#5b6371]">
                    No orders found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-[14px] text-[#5b6371]">
          <span>
            {orders.length > 0
              ? `Showing ${((data?.pagination?.page || page) - 1) * 12 + 1} to ${((data?.pagination?.page || page) - 1) * 12 + orders.length} of ${data?.pagination?.total || orders.length} results`
              : "Showing 0 results"}
          </span>
          <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
        </div>
      </SectionCard>

      <Modal open={!!viewing} onClose={() => setViewing(null)} className="max-w-[640px]">
        {orderQuery.data ? (
          (() => {
            const o = orderQuery.data;
            const status = (o.status || "pending").toLowerCase();
            const shippingFee = Number(o.shippingFee ?? o.deliveryFee ?? 0);
            const subtotal = Number(o.subtotal ?? o.totalAmount ?? 0);
            const total = subtotal + shippingFee;
            const paymentStatus = o.paymentStatus || o.payment?.paymentStatus || "pending";
            const paymentMethod =
              o.payment?.paymentMethod || o.paymentMethod || (paymentStatus === "complete" || paymentStatus === "paid" ? "Stripe" : "Cash on Delivery");
            return (
              <>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="flex items-center gap-3 text-[22px] font-semibold text-[#202124]">
                      Order {o.orderId || o._id}
                    </h2>
                    <p className="mt-1 text-[14px] text-[#5b6371]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                  <button onClick={() => setViewing(null)} type="button" className="text-[#5b6371]">
                    <X className="size-5" />
                  </button>
                </div>

                <SectionCard className="mb-4 border border-[#e3e6ec]">
                  <h3 className="flex items-center gap-2 text-[16px] font-semibold text-[#3d8ef5]">
                    <User className="size-5" /> Customer Details
                  </h3>
                  <div className="mt-3 space-y-2 text-[14px] text-[#202124]">
                    <p className="flex items-center gap-2"><User className="size-4 text-[#5b6371]" /> Name: <span className="font-semibold">{o.customer?.name || "N/A"}</span></p>
                    <p className="flex items-center gap-2"><Phone className="size-4 text-[#5b6371]" /> Phone Number: <span className="font-semibold">{o.customer?.phone || "N/A"}</span></p>
                    <p className="flex items-center gap-2"><MapPin className="size-4 text-[#5b6371]" /> Delivery Address: <span className="font-semibold">{o.address || "N/A"}</span></p>
                  </div>
                </SectionCard>

                <SectionCard className="mb-4 border border-[#e3e6ec]">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="flex items-center gap-2 text-[16px] font-semibold text-[#202124]">
                      <Truck className="size-5 text-[#3d8ef5]" /> Order Status
                    </h3>
                    <select
                      value={status}
                      onChange={(event) => handleStatusChange(o.orderId || o._id, status, event.target.value)}
                      disabled={statusMutation.isPending}
                      className="h-10 rounded-[12px] border border-[#cfd4dc] bg-white px-4 text-[14px] font-semibold capitalize text-[#202124] outline-none disabled:opacity-60"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-0">
                    {statusSteps.map((step, index) => {
                      const activeIndex = statusSteps.findIndex((item) => item.value === status);
                      const isComplete = activeIndex >= index;
                      const isCurrent = activeIndex === index;

                      return (
                        <div key={step.value} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={cn(
                                "flex size-5 items-center justify-center rounded-full border-2",
                                isComplete ? "border-[#3d8ef5] bg-[#3d8ef5] text-white" : "border-[#d8dde6] bg-white text-transparent",
                              )}
                            >
                              <Check className="size-3" />
                            </span>
                            {index < statusSteps.length - 1 ? (
                              <span className={cn("h-11 w-px", activeIndex > index ? "bg-[#3d8ef5]" : "bg-[#d8dde6]")} />
                            ) : null}
                          </div>
                          <div className={cn(index < statusSteps.length - 1 ? "pb-5" : "", "-mt-0.5")}>
                            <p className={cn("text-[15px] font-semibold", isCurrent ? "text-[#3d8ef5]" : "text-[#202124]")}>
                              {step.label}
                            </p>
                            <p className="mt-1 text-[12px] text-[#9aa1ad]">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                <SectionCard className="border border-[#e3e6ec]">
                  <h3 className="flex items-center gap-2 text-[16px] font-semibold text-[#3d8ef5]">
                    <ShoppingBag className="size-5" /> Order Items Summary
                  </h3>
                  <div className="mt-3 space-y-2 text-[14px]">
                    <div className="flex justify-between gap-4">
                      <span className="inline-flex items-center gap-2"><CreditCard className="size-4 text-[#5b6371]" /> Payment Method:</span>
                      <span className="font-semibold">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Payment Status:</span>
                      <span className="font-semibold capitalize">{paymentStatus.replaceAll("_", " ")}</span>
                    </div>
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(shippingFee)}</span></div>
                    <div className="flex justify-between border-t border-[#e3e6ec] pt-2 text-[16px] font-semibold">
                      <span>Total</span>
                      <span className="text-[#3d8ef5]">{formatCurrency(total)}</span>
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
