import { apiClient } from "./client";

export async function listBookings() {
  const { data } = await apiClient.get("/bookings");
  return data;
}
