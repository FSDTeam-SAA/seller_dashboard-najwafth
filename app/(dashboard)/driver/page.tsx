"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MapPin, Phone, Plus, Send, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MetricCard, Modal, ModalHeader, PageFrame, SectionCard, StatusPill } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDriverRequest, getMyDriverRequests, getSellerOrders, getSellerOverview } from "@/lib/api";
import { formatDate, toText } from "@/lib/utils";

type Driver = {
  _id: string;
  customerName?: string;
  shopName?: string;
  name?: string;
  phone?: string;
  vehicle?: string;
  vehicleId?: string;
  address?: string;
  location?: string;
  status?: string;
  orderId?: string | { orderId?: string; _id?: string };
  scheduledAt?: string;
  orderDate?: string;
};

type SellerOrder = {
  _id: string;
  orderId: string;
  totalAmount?: number;
  address?: string;
  createdAt?: string;
  status?: string;
  customer?: {
    name?: string;
  };
  items?: Array<{
    quantity?: number;
  }>;
};

type SellerOrdersResponse = {
  orders: SellerOrder[];
};

const emptyForm = {
  shopName: "",
  shopPhone: "",
  location: "",
  orderDate: "",
  customerName: "",
  totalItems: "",
  orderId: "",
  price: "",
  customerLocation: "",
  message: "",
};

function toDateInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function DriverPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const overview = useQuery<{ metrics?: { ordersToday?: number; totalCompletedOrders?: number } }>({
    queryKey: ["seller-overview"],
    queryFn: getSellerOverview,
  });
  const driversQuery = useQuery<{ requests?: Driver[] } | Driver[]>({
    queryKey: ["seller-drivers"],
    queryFn: getMyDriverRequests,
  });
  const ordersQuery = useQuery<SellerOrdersResponse>({
    queryKey: ["seller-orders", "driver-request"],
    queryFn: () => getSellerOrders({ page: 1, limit: 100 }),
    enabled: open,
  });

  const list = (Array.isArray(driversQuery.data) ? driversQuery.data : driversQuery.data?.requests) || [];
  const orders = ordersQuery.data?.orders || [];
  const assignedOrderIds = new Set(
    list
      .map((driver) => {
        if (driver.orderId && typeof driver.orderId === "object") {
          return driver.orderId.orderId;
        }
        return undefined;
      })
      .filter(Boolean),
  );
  const availableOrders = orders.filter((order) => !assignedOrderIds.has(order.orderId));

  const handleOrderSelect = (selectedOrderId: string) => {
    const selectedOrder = availableOrders.find((order) => order.orderId === selectedOrderId);

    if (!selectedOrder) {
      setForm((prev) => ({
        ...prev,
        orderId: "",
        orderDate: "",
        customerName: "",
        totalItems: "",
        price: "",
        customerLocation: "",
      }));
      return;
    }

    const totalItems = (selectedOrder.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

    setForm((prev) => ({
      ...prev,
      orderId: selectedOrder.orderId,
      orderDate: toDateInputValue(selectedOrder.createdAt),
      customerName: selectedOrder.customer?.name || "",
      totalItems: totalItems > 0 ? String(totalItems) : "",
      price: selectedOrder.totalAmount != null ? String(selectedOrder.totalAmount) : "",
      customerLocation: selectedOrder.address || "",
    }));
  };

  const createMutation = useMutation({
    mutationFn: createDriverRequest,
    onSuccess: () => {
      toast.success("Driver request submitted.");
      queryClient.invalidateQueries({ queryKey: ["seller-drivers"] });
      setOpen(false);
      setForm(emptyForm);
    },
  });

  return (
    <PageFrame
      title="Driver Management"
      subtitle="Manage drivers and track driver status in real time."
      action={
        <Button className="bg-[#103670] text-white hover:bg-[#0d2856]" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New Request For Driver
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard
          label="Orders Today"
          value={overview.data?.metrics?.ordersToday ?? 0}
          icon={<ShoppingCart className="size-5" />}
          iconBg="bg-[#3d8ef5]"
          iconColor="text-white"
        />
        <MetricCard
          label="Completed Orders"
          value={overview.data?.metrics?.totalCompletedOrders ?? 0}
          icon={<ShoppingCart className="size-5" />}
          iconBg="bg-[#3d8ef5]"
          iconColor="text-white"
        />
      </div>

      <SectionCard className="mt-6 bg-[#eef4ff]">
        <h2 className="text-[20px] font-semibold text-[#202124]">Assigned Drivers</h2>
        <p className="text-[14px] text-[#5b6371]">Drivers assigned to handle and deliver current orders.</p>

        <div className="mt-4 space-y-3">
          {list.map((driver) => {
            const displayName = driver.name || driver.customerName || driver.shopName || "Driver request";
            const initials = displayName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={driver._id} className="flex items-center gap-4 rounded-[12px] bg-white p-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#3d8ef5] text-[16px] font-semibold text-white">
                  {initials}
                </div>
                <div className="flex-1 grid gap-1 text-[14px]">
                  <p className="text-[16px] font-semibold text-[#202124]">{displayName}</p>
                  <p className="text-[#5b6371]">
                    Vehicle: <span className="text-[#3d8ef5]">{driver.vehicle || "N/A"}</span>
                  </p>
                  <p className="text-[#5b6371]">
                    ID: <span className="text-[#3d8ef5]">{driver.vehicleId || "N/A"}</span>
                  </p>
                  <p className="flex items-center gap-1 text-[#3d8ef5]">
                    <Phone className="size-3.5" /> {driver.phone || "N/A"}
                  </p>
                  <p className="flex items-start gap-1 text-[#5b6371]">
                    <MapPin className="size-3.5 text-[#3d8ef5]" />
                    Delivery Address {driver.location || driver.address || "N/A"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusPill status={driver.status || "pending"} />
                  <p className="text-[#3d8ef5]">{toText(driver.orderId, "N/A")}</p>
                  <p className="flex items-center gap-1 text-[12px] text-[#5b6371]">
                    <Clock className="size-3.5" /> {driver.scheduledAt ? formatDate(driver.scheduledAt) : driver.orderDate ? formatDate(driver.orderDate) : "N/A"}
                  </p>
                </div>
              </div>
            );
          })}
          {list.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#cfd4dc] bg-white px-4 py-10 text-center text-[#5b6371]">
              No driver requests yet
            </div>
          ) : null}
        </div>
      </SectionCard>

      <Modal open={open} onClose={() => setOpen(false)} className="max-w-[820px]">
        <ModalHeader title="Add new request" subtitle="Submit a delivery request for one of your orders." onClose={() => setOpen(false)} />

        <h3 className="mb-3 text-[16px] font-semibold text-[#3d8ef5]">Books Store Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Books Store Name *</label>
            <Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} placeholder="Books on wheels" />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Phone Number*</label>
            <Input value={form.shopPhone} onChange={(e) => setForm({ ...form, shopPhone: e.target.value })} placeholder="01810641003" />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Location *</label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="456 Park Avenue, Dhaka 1207" />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Order Date: *</label>
            <Input type="date" value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} />
          </div>
        </div>

        <h3 className="mb-3 mt-6 text-[16px] font-semibold text-[#3d8ef5]">Customer Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Customer Name *</label>
            <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Total Items *</label>
            <Input value={form.totalItems} onChange={(e) => setForm({ ...form, totalItems: e.target.value })} placeholder="4 Books" />
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Order *</label>
            <select
              className="h-12 w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 text-[14px] text-[#202124]"
              value={form.orderId}
              onChange={(e) => handleOrderSelect(e.target.value)}
              disabled={ordersQuery.isLoading}
            >
              <option value="">{ordersQuery.isLoading ? "Loading orders..." : "Select order"}</option>
              {availableOrders.map((order) => (
                <option key={order._id} value={order.orderId}>
                  {order.orderId} - {order.customer?.name || "Customer"}{order.status ? ` (${order.status})` : ""}
                </option>
              ))}
            </select>
            {!ordersQuery.isLoading && availableOrders.length === 0 ? (
              <p className="mt-2 text-[12px] text-[#5b6371]">No unassigned seller orders available.</p>
            ) : null}
          </div>
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Price *</label>
            <Input value={form.price} readOnly placeholder="$12.00" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Location *</label>
            <Input value={form.customerLocation} onChange={(e) => setForm({ ...form, customerLocation: e.target.value })} placeholder="456 Park Avenue, Dhaka 1207" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-[14px] font-medium text-[#202124]">Message</label>
            <textarea
              className="min-h-[100px] w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 py-3 text-[14px]"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="A book on behavioral psychology and decision-making."
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} type="button">
            Cancel
          </Button>
          <Button
            className="bg-[#6d98c0] hover:bg-[#5f88ae]"
            disabled={createMutation.isPending}
            onClick={() =>
              createMutation.mutate({
                shopName: form.shopName,
                shopPhone: form.shopPhone,
                location: form.location,
                orderDate: form.orderDate,
                customerName: form.customerName,
                item: form.totalItems,
                orderId: form.orderId,
                price: form.price,
                customerLocation: form.customerLocation,
                message: form.message,
              })
            }
            type="button"
          >
            <Send className="size-4" /> {createMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
        <button className="hidden" type="button" aria-hidden>
          <X />
        </button>
      </Modal>
    </PageFrame>
  );
}
