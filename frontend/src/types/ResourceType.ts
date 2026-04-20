export interface ResourceType {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ResourceTypeRequest {
  name: string;
  category: string;
  description?: string;
  icon?: string;
}