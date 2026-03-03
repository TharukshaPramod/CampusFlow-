import { apiClient } from "./client";

export async function listIncidents() {
  const { data } = await apiClient.get("/incidents");
  return data;
}
