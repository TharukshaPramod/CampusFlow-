import { apiClient } from "./client";

export async function listUsers() {
  const { data } = await apiClient.get("/users");
  return data;
}

export async function updateUser(
  id: string,
  payload: { name?: string; email?: string; password?: string }
) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await apiClient.delete(`/users/${id}`);
  return data;
}

export async function inviteAdmin(payload: { name: string; email: string }) {
  const { data } = await apiClient.post("/auth/invite-admin", payload);
  return data;
}

export async function getTechnicians() {
  const { data } = await apiClient.get("/users/technicians");
  return data;
}
