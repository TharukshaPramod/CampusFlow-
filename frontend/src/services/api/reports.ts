import { apiClient } from "./client";

export async function exportReport(type: string) {
  const { data } = await apiClient.get(`/reports/${type}`);
  return data;
}
