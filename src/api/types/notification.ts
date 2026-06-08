import type {QueryValue} from './common';

export type NotificationChannel = 'email' | 'push';

export type ApiNotification = {
  id: string;
  audioId?: string;
  title?: string;
  body?: string;
  message?: string;
  channel?: NotificationChannel;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  severity?: string;
  county?: string;
  talkgroup?: string;
  metadata?: Record<string, unknown>;
  audio?: Record<string, unknown> | {id?: string};
};

export type NotificationListParams = {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  channel?: NotificationChannel;
};

export type NotificationListResult = {
  items: ApiNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  totalFromApi: boolean;
};
