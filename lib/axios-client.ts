"use client";

import axios from "axios";
import { signOut, getSession } from "next-auth/react";
import { toast } from "sonner";
import { getBaseUrl } from "./utils";

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
});

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    const skipToast = error.config?.headers?.["x-skip-toast"] === "1";

    if (error.response?.status === 401) {
      await signOut({ callbackUrl: "/auth/signin" });
      return Promise.reject(error);
    }

    if (typeof window !== "undefined" && !skipToast) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);
