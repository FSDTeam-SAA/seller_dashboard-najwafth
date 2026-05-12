import axios from "axios";
import { getBaseUrl } from "./utils";

const authClient = axios.create({
  baseURL: getBaseUrl(),
});

export async function registerSeller(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await authClient.post("/auth/register", {
    ...payload,
    role: "seller",
  });

  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await authClient.post("/auth/forgot-password", { email });
  return response.data;
}

export async function verifyPasswordResetOtp(payload: { email: string; otp: string }) {
  const response = await authClient.post("/auth/verify-otp", payload);
  return response.data;
}

export async function resetPasswordWithOtp(payload: { email: string; otp: string; password: string }) {
  const response = await authClient.post("/auth/reset-password", payload);
  return response.data;
}
