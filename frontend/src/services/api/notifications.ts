import { apiClient } from "./client";

export async function listNotifications() {
  const { data } = await apiClient.get("/notifications");
  return data;
}
