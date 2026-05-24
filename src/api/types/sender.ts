export type ApiSender = {
  id: string;
  name?: string;
  email?: string;
  domain?: string;
  status?: string;
  token?: string;
  apiToken?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type SenderSearchParams = {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  status?: string;
};

export type CreateSenderPayload = {
  name: string;
  email?: string;
  description?: string;
  status?: string;
};

export type UpdateSenderPayload = Partial<CreateSenderPayload>;
