import type {KeywordSeverity} from './severity';

export type ApiKeyword = {
  id: string;
  keyword?: string;
  name?: string;
  text?: string;
  active?: boolean;
  isActive?: boolean;
  description?: string | null;
  severity?: KeywordSeverity | null;
  priority?: string;
  level?: string;
  createdAt?: string;
  created_at?: string;
  [key: string]: unknown;
};

export type KeywordSearchParams = {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  keyword?: string;
  severity?: string;
  active?: boolean;
};

export type CreateKeywordPayload = {
  keyword: string;
  active?: boolean;
  description?: string | null;
  severity?: KeywordSeverity | null;
  priority?: string;
};

export type UpdateKeywordPayload = Partial<CreateKeywordPayload>;
