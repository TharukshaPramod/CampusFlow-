import { apiClient } from "./client";
import {
  Incident,
  IncidentCreateRequest,
  IncidentUpdateRequest,
  IncidentStatusUpdate,
  IncidentCommentRequest,
  IncidentComment
} from "../../types/incident";

export const incidentService = {
  createIncident: async (request: IncidentCreateRequest): Promise<Incident> => {
    const { data } = await apiClient.post<Incident>("/v1/incidents", request);
    return data;
  },

  getAllIncidents: async (): Promise<Incident[]> => {
    const { data } = await apiClient.get<Incident[]>("/v1/incidents");
    return data;
  },

  getIncidentById: async (id: string): Promise<Incident> => {
    const { data } = await apiClient.get<Incident>(`/v1/incidents/${id}`);
    return data;
  },

  updateStatus: async (id: string, update: IncidentStatusUpdate): Promise<Incident> => {
    const { data } = await apiClient.patch<Incident>(`/v1/incidents/${id}/status`, update);
    return data;
  },

  updateIncident: async (id: string, request: IncidentUpdateRequest): Promise<Incident> => {
    const { data } = await apiClient.put<Incident>(`/v1/incidents/${id}`, request);
    return data;
  },

  deleteIncident: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/incidents/${id}`);
  },

  assignTechnician: async (id: string, technicianId: string): Promise<Incident> => {
    const { data } = await apiClient.patch<Incident>(`/v1/incidents/${id}/assign`, null, {
      params: { technicianId },
    });
    return data;
  },

  addComment: async (id: string, request: IncidentCommentRequest): Promise<IncidentComment> => {
    const { data } = await apiClient.post<IncidentComment>(`/v1/incidents/${id}/comments`, request);
    return data;
  },

  editComment: async (commentId: string, request: IncidentCommentRequest): Promise<IncidentComment> => {
    const { data } = await apiClient.put<IncidentComment>(`/v1/incidents/comments/${commentId}`, request);
    return data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/v1/incidents/comments/${commentId}`);
  },
};
