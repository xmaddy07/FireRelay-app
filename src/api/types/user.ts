export type ApiUser = {
  id: string;
  email?: string;
  role?: string;
  createdAt?: string;
  created_at?: string;
  counties?: unknown;
  [key: string]: unknown;
};

export type ApiCounty = {
  id: string;
  name?: string;
  code?: string;
  state?: string;
  established?: string;
  est?: string;
  [key: string]: unknown;
};

export type UserSearchParams = {
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  email?: string;
  role?: string;
};

export type CreateUserPayload = {
  email: string;
  role?: string;
  password?: string;
};

export type FeedSeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type UpdateUserPayload = {
  email?: string;
  role?: string;
  password?: string;
  /** null or [] = unrestricted; non-empty = restricted to these max severities */
  allowedSeverities?: FeedSeverityLevel[] | null;
};

export type AssignCountiesPayload = {
  countyIds: string[];
};

export type ApiUserSession = {
  id: string;
  userId?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  lastSeenAt?: string;
  expiresAt?: string;
  revokedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type ApiUserTalkgroupAccess = {
  id: string;
  userId?: string;
  countyId?: string;
  talkgroupID?: string;
  talkgroup?: string;
  county?: unknown;
  [key: string]: unknown;
};

export type AssignTalkgroupAccessRequest = {
  access: Array<{
    countyId: string;
    talkgroupID: string;
    talkgroup?: string;
  }>;
};

