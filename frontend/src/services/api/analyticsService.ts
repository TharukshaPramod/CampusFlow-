import { apiClient } from './client';

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
    const { data } = await apiClient.get<ResourceAnalytics>('/admin/analytics/resources');
    return data;
  },
};