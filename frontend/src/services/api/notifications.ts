import { apiClient } from "./client";

export async function listNotifications() {
  const { data } = await apiClient.get("/notifications");
  return data;
}

export async function unreadNotificationCount() {
  const { data } = await apiClient.get("/notifications/unread-count");
  return data?.count ?? 0;
}

export async function markNotificationRead(id: string) {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await apiClient.patch("/notifications/read-all");
}
