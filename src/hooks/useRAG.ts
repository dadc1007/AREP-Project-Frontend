import { useQuery, useMutation } from '@tanstack/react-query';
import { ragService } from '../services/ragService';
import type { 
  AskRequest, 
  AskResponse, 
  TenantConfig, 
  UpdateConfigResponse, 
  TenantMetrics 
} from '../types/api';

export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: ragService.getTenants,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: ({ tenantId, file }: { tenantId: string; file: File }) =>
      ragService.uploadDocument(tenantId, file),
  });
};

export const useAskQuestion = () => {
  return useMutation<AskResponse, Error, AskRequest>({
    mutationFn: (requestData: AskRequest) => ragService.askQuestion(requestData),
  });
};

export const useTenantConfig = (tenantId: string) => {
  return useQuery<TenantConfig, Error>({
    queryKey: ['tenant-config', tenantId],
    queryFn: () => ragService.getTenantConfig(tenantId),
    enabled: !!tenantId,
  });
};

export const useUpdateTenantConfig = () => {
  return useMutation<UpdateConfigResponse, Error, { tenantId: string; config: Partial<TenantConfig> }>({
    mutationFn: ({ tenantId, config }) => ragService.updateTenantConfig(tenantId, config),
  });
};

export const useTenantMetrics = (tenantId: string) => {
  return useQuery<TenantMetrics, Error>({
    queryKey: ['tenant-metrics', tenantId],
    queryFn: () => ragService.getTenantMetrics(tenantId),
    enabled: !!tenantId,
  });
};
