import { apiClient } from "./client";

export async function login(payload: Record<string, unknown>) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function me() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}
