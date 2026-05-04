import { axiosClient } from './axiosClient';
import type { AskRequest, AskResponse } from '../types/api';

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
};
