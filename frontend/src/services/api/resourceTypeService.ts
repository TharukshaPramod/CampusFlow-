import type { ResourceType, ResourceTypeRequest } from '../../types/ResourceType';
import api from './client';

export const resourceTypeService = {

  getAll: async (): Promise<ResourceType[]> => {
    const { data } = await api.get<any>('/v1/resource-types');
    // Handle both paginated and non-paginated responses
    return (data.content || data) ?? [];
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
    try {
      const { data } = await api.post<ResourceType>('/v1/resource-types', resourceType);
      return data;
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      throw new Error(backendMessage || 'Failed to create resource type');
    }
  },

  update: async (id: string, resourceType: ResourceTypeRequest): Promise<ResourceType> => {
    try {
      const { data } = await api.put<ResourceType>(`/v1/resource-types/${id}`, resourceType);
      return data;
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      console.error('Update resource type error:', error.response?.data || error.message);
      throw new Error(backendMessage || 'Failed to update resource type');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/v1/resource-types/${id}`);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      throw new Error(backendMessage || 'Failed to delete resource type');
    }
  },
};