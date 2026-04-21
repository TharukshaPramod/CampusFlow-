import { apiClient } from "./client";
import {
  Incident,
  IncidentCreateRequest,
  IncidentUpdateRequest,
  IncidentStatusUpdate,
  IncidentCommentRequest,
  IncidentComment,
  IncidentAttachment,
  IncidentAddAttachmentsRequest,
  IncidentAnalyticsResponse
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

  addAttachments: async (id: string, request: IncidentAddAttachmentsRequest): Promise<IncidentAttachment[]> => {
    const { data } = await apiClient.post<IncidentAttachment[]>(`/v1/incidents/${id}/attachments`, request);
    return data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(`/v1/incidents/attachments/${attachmentId}`);
  },

  getAnalytics: async (): Promise<IncidentAnalyticsResponse> => {
    const { data } = await apiClient.get<IncidentAnalyticsResponse>("/v1/incidents/analytics");
    return data;
  },

  downloadPdfReport: async (id: string): Promise<void> => {
    const response = await apiClient.get(`/v1/incidents/${id}/report/pdf`, {
      responseType: 'blob', // Important for downloading files
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Extract filename from header if possible, or fallback
    let fileName = `Incident_Report_${id}.pdf`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) { 
          fileName = matches[1].replace(/['"]/g, '');
        }
    }
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
