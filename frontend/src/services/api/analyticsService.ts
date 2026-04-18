import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export interface TypeCount {
  typeName: string;
  category: string;
  count: number;
}

export interface BuildingCount {
  building: string;
  count: number;
}

export interface MaintenanceItem {
  resourceId: string;
  resourceName: string;
  building: string;
  location: string;
  startDate: string;
  endDate: string;
  maintenanceStatus: string;
}

export interface ResourceAnalytics {
  totalResources: number;
  activeResources: number;
  outOfServiceResources: number;
  maintenanceResources: number;
  inactiveResources: number;
  resourcesByType: TypeCount[];
  resourcesByBuilding: BuildingCount[];
  currentlyUnderMaintenance: MaintenanceItem[];
  requiresApprovalCount: number;
  noApprovalRequiredCount: number;
}

export const analyticsService = {
  getResourceAnalytics: async (): Promise<ResourceAnalytics> => {
    const { data } = await api.get<ResourceAnalytics>('/analytics/resources');
    return data;
  },
};