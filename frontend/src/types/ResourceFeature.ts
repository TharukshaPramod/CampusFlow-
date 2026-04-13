export interface ResourceFeature {
  id: string;
  resourceId: string;
  featureName: string;
  featureValue?: string;
  createdAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ResourceFeatureRequest {
  featureName: string;
  featureValue?: string;
}