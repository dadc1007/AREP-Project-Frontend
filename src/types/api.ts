export interface AskRequest {
  question: string;
  tenant_id: string;
}

export interface AskResponse {
  tenant_id: string;
  question: string;
  answer: string;
  sources: string[];
}

export interface TenantConfig {
  chunk_size: number;
  chunk_overlap: number;
  use_hyde: boolean;
  use_reranking: boolean;
  temperature: number;
  system_prompt: string;
  max_tokens: number;
}

export interface UpdateConfigResponse {
  message: string;
  config: TenantConfig;
}

export interface TenantMetrics {
  tenant_id: string;
  tokens_used: number;
  queries_count: number;
}
