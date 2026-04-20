import type { ResourceType } from './ResourceType';

export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'INACTIVE';

export interface Resource {
  id: string;
  name: string;
  code?: string;
  description?: string;
  location?: string;
  building?: string;
  floor?: string;
  capacity?: number;
  status: ResourceStatus;
  resourceType?: ResourceType;
  availableDays?: number[];
  availableFrom?: string;
  availableTo?: string;
  images?: string[];
  metadata?: Record<string, unknown>;
  requiresApproval?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ResourceRequest {
  name: string;
  code?: string;
  description?: string;
  location?: string;
  building?: string;
  floor?: string;
  capacity?: number;
  status: ResourceStatus;
  resourceTypeId?: string;
  availableDays?: number[];
  availableFrom?: string;
  availableTo?: string;
  images?: string[];
  metadata?: Record<string, unknown>;
  requiresApproval?: boolean;
}

export interface ResourceFilters {
  status?: ResourceStatus;
  building?: string;
  location?: string;
  minCapacity?: number;
  resourceTypeId?: string;
  requiresApproval?: boolean;
}
