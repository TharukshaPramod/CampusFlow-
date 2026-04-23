import { apiClient } from "./client";

export interface AiTriageRequest {
  title: string;
  description: string;
}

export interface AiTriageResponse {
  suggestedCategory: string;
  suggestedPriority: string;
  reasoning: string;
}

export interface AiResolutionRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  location?: string;
}

export interface AiResolutionResponse {
  steps: string[];
  estimatedTime: string;
  additionalNotes: string;
}

export interface AiSummarizeRequest {
  incidentTitle: string;
  incidentDescription: string;
  comments: { author: string; content: string; timestamp: string }[];
}

export interface AiSummarizeResponse {
  summary: string;
  sentiment: string;
  actionRequired: string;
}

export const aiService = {
  triage: async (request: AiTriageRequest): Promise<AiTriageResponse> => {
    const { data } = await apiClient.post<AiTriageResponse>("/v1/ai/triage", request);
    return data;
  },

  suggestResolution: async (request: AiResolutionRequest): Promise<AiResolutionResponse> => {
    const { data } = await apiClient.post<AiResolutionResponse>("/v1/ai/resolution", request);
    return data;
  },

  summarizeThread: async (request: AiSummarizeRequest): Promise<AiSummarizeResponse> => {
    const { data } = await apiClient.post<AiSummarizeResponse>("/v1/ai/summarize", request);
    return data;
  },

  chatWithBot: async (message: string): Promise<{ response: string }> => {
    const { data } = await apiClient.post<{ response: string }>('/v1/ai/chat', { message });
    return data;
  }
};
