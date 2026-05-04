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
