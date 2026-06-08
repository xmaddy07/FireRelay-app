import {endpoints} from '../endpoints';
import {
  mapNotificationToRecord,
  normalizeApiNotification,
} from '../mappers/notificationMapper';
import type {NotificationRecord} from '../mappers/notificationMapper';
import type {
  ApiNotification,
  NotificationListParams,
} from '../types/notification';
import {
  authorizedRequest,
  buildQuery,
  pickNumber,
  unwrapEntity,
  unwrapPaginated,
} from '../utils';

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

export type NotificationSearchResult = {
  items: NotificationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  totalFromApi: boolean;
};

export async function listNotifications(
  token: string,
  params: NotificationListParams = {},
): Promise<NotificationSearchResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const query = buildQuery({
    page,
    limit,
    unreadOnly: params.unreadOnly === true ? 'true' : undefined,
    channel: params.channel,
  });

  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.notifications.root}${query}`,
  );

  const paginated = unwrapPaginated<ApiNotification>(payload, page, limit);
  return {
    ...paginated,
    items: paginated.items
      .map(normalizeApiNotification)
      .filter((item): item is ApiNotification => item !== null)
      .map(mapNotificationToRecord),
  };
}

export async function getUnreadNotificationCount(token: string): Promise<number> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.notifications.unreadCount,
  );

  const record = toRecord(payload);
  if (!record) {
    return 0;
  }

  const nested = toRecord(record.data);
  const count =
    pickNumber(record, ['count']) ??
    (nested ? pickNumber(nested, ['count']) : undefined);

  return count ?? 0;
}

export async function markNotificationRead(
  token: string,
  id: string,
): Promise<NotificationRecord> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.notifications.markRead(id),
    {method: 'PATCH'},
  );

  const entity = unwrapEntity<ApiNotification>(payload);
  const normalized = normalizeApiNotification(entity) ?? entity;
  return mapNotificationToRecord(normalized);
}

export async function markAllNotificationsRead(
  token: string,
): Promise<number> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.notifications.readAll,
    {method: 'PATCH'},
  );

  const record = toRecord(payload);
  if (!record) {
    return 0;
  }

  const nested = toRecord(record.data);
  const updated =
    pickNumber(record, ['updated']) ??
    (nested ? pickNumber(nested, ['updated']) : undefined);

  return updated ?? 0;
}
