import { apiClient } from "./axios-client";

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getSellerOverview() {
  const response = await apiClient.get("/dashboard/seller/overview");
  return response.data.data;
}

export async function getSellerOrders(params: { page: number; limit: number; status?: string }) {
  const response = await apiClient.get("/order", { params });
  const orders = response.data.data || [];
  return {
    orders,
    pagination: {
      total: orders.length < params.limit && params.page === 1 ? orders.length : params.page * params.limit + (orders.length === params.limit ? 1 : 0),
      page: params.page,
      limit: params.limit,
      totalPages: orders.length === params.limit ? params.page + 1 : params.page,
    } satisfies PaginationMeta,
  };
}

export async function getSellerBooks(params: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  shopId?: string;
}) {
  const response = await apiClient.get("/books", { params });
  return response.data.data;
}

export async function createBook(payload: Record<string, unknown>) {
  const response = await apiClient.post("/books/add", payload);
  return response.data.data;
}

export async function deleteBook(id: string) {
  const response = await apiClient.delete(`/books/${id}`);
  return response.data;
}

export async function getCategories() {
  const response = await apiClient.get("/category");
  return response.data.data;
}

export async function createCategory(formData: FormData) {
  const response = await apiClient.post("/category/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function getNotifications(page: number, limit: number) {
  const response = await apiClient.get("/notification", { params: { page, limit } });
  return response.data.data;
}

export async function markNotificationAsRead(id: string) {
  const response = await apiClient.patch(`/notification/${id}/read`);
  return response.data.data;
}

export async function markAllNotificationsAsRead() {
  const response = await apiClient.patch("/notification/read-all");
  return response.data.data;
}

export async function getProfile() {
  const response = await apiClient.get("/user/me");
  return response.data.data;
}

export async function updateProfile(formData: FormData) {
  const response = await apiClient.patch("/user/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await apiClient.patch("/user/change-password", payload);
  return response.data.data;
}

export async function updateBook(id: string, payload: Record<string, unknown> | FormData) {
  const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
  const response = await apiClient.patch(`/books/${id}`, payload, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data.data;
}

export async function publishBooks(ids: string[]) {
  const response = await apiClient.patch("/books/publish", { ids });
  return response.data.data;
}

export async function getOrderById(orderId: string) {
  const response = await apiClient.get(`/order/${orderId}`);
  return response.data.data;
}

export async function updateOrderStatus(orderId: string, payload: { status: string }) {
  const response = await apiClient.patch(`/order/${orderId}/status`, payload);
  return response.data.data;
}

export async function getMyShop() {
  const response = await apiClient.get("/shop/my");
  return response.data.data;
}

export async function updateMyShop(formData: FormData) {
  const response = await apiClient.put("/shop/update-shop", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
}

export async function getShopDriverRequests(shopId: string) {
  const response = await apiClient.get(`/driver-request/driver-requests/shop/${shopId}`);
  return response.data.data;
}

export async function getMyDriverRequests(shopId?: string) {
  if (shopId) {
    const response = await apiClient.get(`/driver-request/driver-requests/shop/${shopId}`);
    return response.data.data;
  }
  const response = await apiClient.get("/driver-request/driver-requests");
  return response.data.data;
}

export async function createDriverRequest(payload: Record<string, unknown>) {
  const response = await apiClient.post("/driver-request/driver-request", payload);
  return response.data.data;
}

const silent = { headers: { "x-skip-toast": "1" } };

type SellerOrder = {
  _id?: string;
  orderId?: string;
  createdAt?: string;
  totalAmount?: number;
  status?: string;
  items?: unknown[];
  customer?: { _id?: string; name?: string; email?: string; phone?: string; avatar?: { url?: string }; image?: string };
};

export async function getSellerUsers(params: { page: number; limit: number }) {
  try {
    const response = await apiClient.get("/user/seller/customers", { params, ...silent });
    return response.data.data;
  } catch {
    return undefined;
  }
}

export async function getSellerReviews(params: { page: number; limit: number }) {
  try {
    const response = await apiClient.get("/review", { params, ...silent });
    return response.data.data;
  } catch {
    return undefined;
  }
}

export async function getSellerSales(_params: { period?: "week" | "month" | "year" }) {
  try {
    const overview = await getSellerOverview();
    const orders: SellerOrder[] = overview?.recentOrders || [];
    const completed = orders.filter((o) => o.status === "delivered").length;
    const totalRevenue = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avg = completed > 0 ? totalRevenue / completed : 0;
    type BookEntry = { _id?: string; product?: unknown; quantity?: number };
    const productMap = new Map<string, { _id: string; soldCount: number; product: BookEntry["product"] }>();
    for (const order of orders) {
      for (const item of (order.items || []) as BookEntry[]) {
        const product = item.product as { _id?: string; title?: string; coverImage?: string; image?: { url?: string }; price?: number; rating?: number; author?: string } | undefined;
        const id = (product?._id || "").toString();
        if (!id) continue;
        const existing = productMap.get(id);
        if (existing) existing.soldCount += item.quantity || 1;
        else productMap.set(id, { _id: id, soldCount: item.quantity || 1, product });
      }
    }
    const topBooks = Array.from(productMap.values())
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 10)
      .map((entry) => {
        const p = entry.product as { _id?: string; title?: string; author?: string; coverImage?: string; image?: { url?: string }; price?: number; rating?: number } | undefined;
        return {
          _id: entry._id,
          title: p?.title,
          author: p?.author,
          price: p?.price,
          rating: p?.rating,
          image: p?.image,
          coverImage: p?.coverImage,
          soldCount: entry.soldCount,
        };
      });
    return {
      metrics: {
        totalRevenue: overview?.metrics?.totalRevenue ?? totalRevenue,
        completedOrders: overview?.metrics?.totalCompletedOrders ?? completed,
        avgOrderValue: Number(avg.toFixed(2)),
      },
      analysis: overview?.salesAnalysis || [],
      topBooks,
    };
  } catch {
    return undefined;
  }
}
