import { apiClient } from "./client";

export async function listResources() {
  const { data } = await apiClient.get("/resources");
  return data;
}
