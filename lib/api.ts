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
  const payload = response.data.data || {};
  const orders = Array.isArray(payload) ? payload : payload.orders || [];
  const pagination = Array.isArray(payload) ? undefined : payload.pagination;
  return {
    orders,
    pagination: {
      total: pagination?.total ?? orders.length,
      page: pagination?.page ?? params.page,
      limit: pagination?.limit ?? params.limit,
      totalPages: pagination?.totalPages ?? 1,
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

export async function createBook(payload: Record<string, unknown> | FormData) {
  const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
  const response = await apiClient.post("/books/add", payload, {
    headers: isForm ? { "Content-Type": "multipart/form-data" } : undefined,
  });
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
  const response = await apiClient.put(`/books/${id}`, payload, {
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

export async function getMyDriverRequests() {
  const response = await apiClient.get("/driver-request/driver-requests");
  return response.data.data;
}

export async function createDriverRequest(payload: Record<string, unknown>) {
  const response = await apiClient.post("/driver-request/driver-request", payload);
  return response.data.data;
}

const silent = { headers: { "x-skip-toast": "1" } };

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

export async function getSellerSales(params: { period?: "week" | "month" | "year" }) {
  try {
    void params;
    const overview = await getSellerOverview();
    const orderCount = overview?.metrics?.totalOrders ?? overview?.metrics?.totalCompletedOrders ?? 0;
    const totalRevenue = overview?.metrics?.totalRevenue ?? 0;
    const totalAdminCommission = overview?.metrics?.totalAdminCommission ?? 0;
    const netRevenue = overview?.metrics?.netRevenue ?? Math.max(totalRevenue - totalAdminCommission, 0);
    const avg = orderCount > 0 ? totalRevenue / orderCount : 0;
    return {
      metrics: {
        totalRevenue,
        totalAdminCommission,
        netRevenue,
        completedOrders: orderCount,
        avgOrderValue: Number(avg.toFixed(2)),
      },
      analysis: overview?.salesAnalysis || [],
      topBooks: overview?.topBooks || [],
    };
  } catch {
    return undefined;
  }
}
