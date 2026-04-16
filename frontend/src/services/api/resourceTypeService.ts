import type { ResourceType, ResourceTypeRequest } from '../../types/ResourceType';
import api from './client';

type PageResponse<T> = {
  content: T[];
};

export const resourceTypeService = {

  getAll: async (): Promise<ResourceType[]> => {
    const { data } = await api.get<PageResponse<ResourceType>>('/v1/resource-types');
    return data.content ?? [];
  },

  getById: async (id: string): Promise<ResourceType> => {
    const { data } = await api.get<ResourceType>(`/v1/resource-types/${id}`);
    return data;
  },

  getByCategory: async (category: string): Promise<ResourceType[]> => {
    const { data } = await api.get<ResourceType[]>(`/v1/resource-types/category/${category}`);
    return data;
  },

  create: async (resourceType: ResourceTypeRequest): Promise<ResourceType> => {
    const { data } = await api.post<ResourceType>('/v1/resource-types', resourceType);
    return data;
  },

  update: async (id: string, resourceType: ResourceTypeRequest): Promise<ResourceType> => {
    const { data } = await api.put<ResourceType>(`/v1/resource-types/${id}`, resourceType);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/resource-types/${id}`);
  },
};