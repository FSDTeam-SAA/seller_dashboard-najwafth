"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageFrame } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMyShop, updateMyShop } from "@/lib/api";

type Shop = {
  name?: string;
  ownerName?: string;
  address?: string;
  email?: string;
  phone?: string;
  deliveryArea?: string;
  description?: string;
};

export default function StoreProfilePage() {
  const queryClient = useQueryClient();
  const { data } = useQuery<Shop>({ queryKey: ["my-shop"], queryFn: getMyShop });

  const [form, setForm] = useState<Shop>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateMyShop,
    onSuccess: () => {
      toast.success("Store updated.");
      queryClient.invalidateQueries({ queryKey: ["my-shop"] });
    },
  });

  const submit = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value != null) fd.set(key, String(value));
    });
    updateMutation.mutate(fd);
  };

  return (
    <PageFrame title="Store Profile Management" subtitle="Manage your public store information">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-[16px] font-semibold text-[#202124]">Store Name</label>
          <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lorem" className="bg-white" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[16px] font-semibold text-[#202124]">Owner Name</label>
            <Input value={form.ownerName || ""} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Jane Doe" className="bg-white" />
          </div>
          <div>
            <label className="mb-2 block text-[16px] font-semibold text-[#202124]">Physical Address</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3d8ef5]" />
              <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Literary Lane, Booktown, BK 12345" className="bg-white pl-11" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[16px] font-semibold text-[#202124]">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3d8ef5]" />
              <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hello@chapterandverse.com" className="bg-white pl-11" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[16px] font-semibold text-[#202124]">Phone Number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#3d8ef5]" />
              <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" className="bg-white pl-11" />
            </div>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[16px] font-semibold text-[#202124]">Delivery Coverage Area</label>
          <textarea
            className="min-h-[120px] w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 py-3 text-[14px]"
            value={form.deliveryArea || ""}
            onChange={(e) => setForm({ ...form, deliveryArea: e.target.value })}
            placeholder="Within 10 miles of Booktown"
          />
        </div>
        <div>
          <label className="mb-2 block text-[16px] font-semibold text-[#202124]">Store Description</label>
          <textarea
            className="min-h-[120px] w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 py-3 text-[14px]"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="An independent bookstore curating the best in fiction, non-fiction, and academic texts."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => data && setForm(data)}>
            Cancel
          </Button>
          <Button className="bg-[#6d98c0] hover:bg-[#5f88ae]" disabled={updateMutation.isPending} onClick={submit}>
            <Save className="size-4" /> {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </PageFrame>
  );
}
