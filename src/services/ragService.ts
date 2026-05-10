import { axiosClient } from './axiosClient';
import type { 
  AskRequest, 
  AskResponse, 
  TenantConfig, 
  UpdateConfigResponse, 
  TenantMetrics,
  EvaluationRequest,
  EvaluationRunResponse,
  EvaluationResultsResponse
} from '../types/api';

export const ragService = {
  getTenants: async (): Promise<string[]> => {
    const { data } = await axiosClient.get<{ tenants: string[] }>('/tenants');
    return data.tenants;
  },

  uploadDocument: async (tenantId: string, file: File): Promise<unknown> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await axiosClient.post(`/tenants/${tenantId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  askQuestion: async (requestData: AskRequest): Promise<AskResponse> => {
    const { data } = await axiosClient.post<AskResponse>('/ask', requestData);
    return data;
  },

  getTenantConfig: async (tenantId: string): Promise<TenantConfig> => {
    const { data } = await axiosClient.get<TenantConfig>(`/tenants/${tenantId}/config`);
    return data;
  },

  updateTenantConfig: async (tenantId: string, config: Partial<TenantConfig>): Promise<UpdateConfigResponse> => {
    const { data } = await axiosClient.put<UpdateConfigResponse>(`/tenants/${tenantId}/config`, config);
    return data;
  },

  getTenantMetrics: async (tenantId: string): Promise<TenantMetrics> => {
    const { data } = await axiosClient.get<TenantMetrics>(`/tenants/${tenantId}/metrics`);
    return data;
  },

  runEvaluation: async (requestData: EvaluationRequest): Promise<EvaluationRunResponse> => {
    const { data } = await axiosClient.post<EvaluationRunResponse>('/evaluation/run', requestData);
    return data;
  },

  getEvaluationResults: async (): Promise<EvaluationResultsResponse> => {
    const { data } = await axiosClient.get<EvaluationResultsResponse>('/evaluation/results');
    return data;
  },
};
