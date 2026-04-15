import axios from 'axios';
import type { ResourceType, ResourceTypeRequest } from '../../types/ResourceType';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const resourceTypeService = {

  getAll: async (): Promise<ResourceType[]> => {
    const { data } = await api.get<ResourceType[]>('/resource-types');
    return data;
  },

  getById: async (id: string): Promise<ResourceType> => {
    const { data } = await api.get<ResourceType>(`/resource-types/${id}`);
    return data;
  },

  getByCategory: async (category: string): Promise<ResourceType[]> => {
    const { data } = await api.get<ResourceType[]>('/resource-types', {
      params: { category },
    });
    return data;
  },

  create: async (resourceType: ResourceTypeRequest): Promise<ResourceType> => {
    const { data } = await api.post<ResourceType>('/resource-types', resourceType);
    return data;
  },

  update: async (id: string, resourceType: ResourceTypeRequest): Promise<ResourceType> => {
    const { data } = await api.put<ResourceType>(`/resource-types/${id}`, resourceType);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/resource-types/${id}`);
  },
};