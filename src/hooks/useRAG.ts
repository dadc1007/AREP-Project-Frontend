import { useQuery, useMutation } from '@tanstack/react-query';
import { ragService } from '../services/ragService';
import type { AskRequest, AskResponse } from '../types/api';

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
