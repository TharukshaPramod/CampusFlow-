export type MaintenanceStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ResourceMaintenance {
  id: string;
  resourceId: string;
  startDate: string;
  endDate?: string;
  description?: string;
  status: MaintenanceStatus;
  createdAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ResourceMaintenanceRequest {
  startDate: string;
  endDate?: string;
  description?: string;
  status?: MaintenanceStatus;
}