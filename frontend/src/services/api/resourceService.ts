import axios from 'axios';
import type { Resource, ResourceRequest, ResourceFilters } from '../../types/resource';
import type { ResourceFeature, ResourceFeatureRequest } from '../../types/ResourceFeature';
import type { ResourceMaintenance, ResourceMaintenanceRequest } from '../../types/ResourceMaintenance';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const resourceService = {

  // Resource CRUD
  getAll: async (filters?: ResourceFilters): Promise<Resource[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.building) params.append('building', filters.building);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.minCapacity) params.append('minCapacity', String(filters.minCapacity));
    if (filters?.resourceTypeId) params.append('resourceTypeId', filters.resourceTypeId);
    if (filters?.requiresApproval !== undefined)
      params.append('requiresApproval', String(filters.requiresApproval));
    const { data } = await api.get<Resource[]>('/resources', { params });
    return data;
  },

  getById: async (id: string): Promise<Resource> => {
    const { data } = await api.get<Resource>(`/resources/${id}`);
    return data;
  },

  create: async (resource: ResourceRequest): Promise<Resource> => {
    const { data } = await api.post<Resource>('/resources', resource);
    return data;
  },

  update: async (id: string, resource: ResourceRequest): Promise<Resource> => {
    const { data } = await api.put<Resource>(`/resources/${id}`, resource);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/resources/${id}`);
  },

  // Resource Features
  getFeatures: async (resourceId: string): Promise<ResourceFeature[]> => {
    const { data } = await api.get<ResourceFeature[]>(`/resources/${resourceId}/features`);
    return data;
  },

  addFeature: async (resourceId: string, feature: ResourceFeatureRequest): Promise<ResourceFeature> => {
    const { data } = await api.post<ResourceFeature>(`/resources/${resourceId}/features`, feature);
    return data;
  },

  deleteFeature: async (resourceId: string, featureId: string): Promise<void> => {
    await api.delete(`/resources/${resourceId}/features/${featureId}`);
  },

  // Resource Maintenance
  getMaintenanceSchedules: async (resourceId: string): Promise<ResourceMaintenance[]> => {
    const { data } = await api.get<ResourceMaintenance[]>(`/resources/${resourceId}/maintenance`);
    return data;
  },

  addMaintenanceSchedule: async (
    resourceId: string,
    schedule: ResourceMaintenanceRequest
  ): Promise<ResourceMaintenance> => {
    const { data } = await api.post<ResourceMaintenance>(
      `/resources/${resourceId}/maintenance`,
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
      `/resources/${resourceId}/maintenance/${scheduleId}`,
      schedule
    );
    return data;
  },
};