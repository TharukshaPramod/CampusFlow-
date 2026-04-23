import type { Resource, ResourceRequest, ResourceFilters } from '../../types/resource';
import type { ResourceFeature, ResourceFeatureRequest } from '../../types/ResourceFeature';
import type { ResourceMaintenance, ResourceMaintenanceRequest } from '../../types/ResourceMaintenance';
import api from './client';

type PageResponse<T> = {
  content: T[];
};

const hasActiveFilters = (filters?: ResourceFilters) =>
  Boolean(
    filters?.status ||
      filters?.building ||
      filters?.location ||
      filters?.minCapacity !== undefined ||
      filters?.resourceTypeId
  );

export const resourceService = {

  // Resource CRUD
  getAll: async (filters?: ResourceFilters): Promise<Resource[]> => {
    if (hasActiveFilters(filters)) {
      const params = {
        searchTerm: filters?.location,
        status: filters?.status,
        building: filters?.building,
        minCapacity: filters?.minCapacity,
        typeId: filters?.resourceTypeId,
      };
      const { data } = await api.get<PageResponse<Resource>>('/v1/resources/search', { params });
      return data.content ?? [];
    }

    const { data } = await api.get<PageResponse<Resource>>('/v1/resources');
    return data.content ?? [];
  },

  getById: async (id: string): Promise<Resource> => {
    const { data } = await api.get<Resource>(`/v1/resources/${id}`);
    return data;
  },

  getByCode: async (code: string): Promise<Resource> => {
    const { data } = await api.get<Resource>(`/v1/resources/code/${encodeURIComponent(code)}`);
    return data;
  },

  create: async (resource: ResourceRequest): Promise<Resource> => {
    const { data } = await api.post<Resource>('/v1/resources', resource);
    return data;
  },

  update: async (id: string, resource: ResourceRequest): Promise<Resource> => {
    const { data } = await api.put<Resource>(`/v1/resources/${id}`, resource);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/resources/${id}`);
  },

  // Resource Features
  getFeatures: async (resourceId: string): Promise<ResourceFeature[]> => {
    const { data } = await api.get<ResourceFeature[]>(`/v1/resources/${resourceId}/features`);
    return data;
  },

  addFeature: async (resourceId: string, feature: ResourceFeatureRequest): Promise<ResourceFeature> => {
    const { data } = await api.post<ResourceFeature>(`/v1/resources/${resourceId}/features`, feature);
    return data;
  },

  deleteFeature: async (resourceId: string, featureId: string): Promise<void> => {
    await api.delete(`/v1/resources/${resourceId}/features/${featureId}`);
  },

  // Resource Maintenance
  getMaintenanceSchedules: async (resourceId: string): Promise<ResourceMaintenance[]> => {
    const { data } = await api.get<ResourceMaintenance[]>(`/v1/resources/${resourceId}/maintenance`);
    return data;
  },

  addMaintenanceSchedule: async (
    resourceId: string,
    schedule: ResourceMaintenanceRequest
  ): Promise<ResourceMaintenance> => {
    const { data } = await api.post<ResourceMaintenance>(
      `/v1/resources/${resourceId}/maintenance`,
      schedule
    );
    return data;
  },

  updateMaintenanceSchedule: async (
    resourceId: string,
    scheduleId: string,
    schedule: ResourceMaintenanceRequest
  ): Promise<ResourceMaintenance> => {
    const { data } = await api.put<ResourceMaintenance>(
      `/v1/resources/${resourceId}/maintenance/${scheduleId}`,
      schedule
    );
    return data;
  },
};