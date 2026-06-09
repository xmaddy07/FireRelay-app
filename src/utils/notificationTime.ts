import {getAudioById} from '../api/services/audioService';
import type {NotificationRecord} from '../api/mappers/notificationMapper';

const hasExplicitTimezone = (value: string): boolean =>
  /[Zz]$|[+-]\d{2}:?\d{2}$/.test(value.trim());

/** API timestamps are UTC; ISO strings without a zone must not be parsed as local time. */
const normalizeNotificationDateInput = (value: string): string => {
  const trimmed = value.trim().replace(' ', 'T');
  if (hasExplicitTimezone(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?$/.test(trimmed)) {
    return `${trimmed}Z`;
  }

  return trimmed;
};

export function notificationCreatedAtMs(
  createdAt: string | number | Date | null | undefined,
): number | null {
  if (createdAt == null) {
    return null;
  }

  if (createdAt instanceof Date) {
    const ms = createdAt.getTime();
    return Number.isNaN(ms) ? null : ms;
  }

  if (typeof createdAt === 'number' && Number.isFinite(createdAt)) {
    const ms = createdAt < 1e12 ? createdAt * 1000 : createdAt;
    const parsed = new Date(ms);
    return Number.isNaN(parsed.getTime()) ? null : ms;
  }

  if (typeof createdAt === 'string') {
    const trimmed = createdAt.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (Number.isFinite(num)) {
        const ms = num < 1e12 ? num * 1000 : num;
        const parsed = new Date(ms);
        return Number.isNaN(parsed.getTime()) ? null : ms;
      }
    }

    const parsed = new Date(normalizeNotificationDateInput(trimmed));
    return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
  }

  return null;
}

export function formatRelativeTimeFromDiffMs(diffMs: number): string {
  if (diffMs < 60_000) {
    return 'Just now';
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (diffMs < 3_600_000) {
    return minutes === 1 ? '1 min ago' : `${minutes} min ago`;
  }

  const hours = Math.floor(diffMs / 3_600_000);
  if (diffMs < 86_400_000) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(diffMs / 86_400_000);
  if (diffMs < 604_800_000) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const weeks = Math.floor(diffMs / 604_800_000);
  if (diffMs < 2_592_000_000) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  const months = Math.floor(diffMs / 2_592_000_000);
  if (diffMs < 31_536_000_000) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(diffMs / 31_536_000_000);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

export function formatNotificationTime(
  createdAt: string | number | Date | null | undefined,
  nowMs = Date.now(),
): string {
  const createdAtMs = notificationCreatedAtMs(createdAt);
  if (createdAtMs == null) {
    return '—';
  }

  const diffMs = Math.max(0, nowMs - createdAtMs);
  return formatRelativeTimeFromDiffMs(diffMs);
}

export function isNotificationAudioTimestampPending(
  notification: Pick<NotificationRecord, 'audioId' | 'audioTimestamp'>,
  audioTimestamps: ReadonlyMap<string, string>,
  resolvedAudioIds?: ReadonlySet<string>,
): boolean {
  if (!notification.audioId || notification.audioTimestamp) {
    return false;
  }

  if (audioTimestamps.has(notification.audioId)) {
    return false;
  }

  return !resolvedAudioIds?.has(notification.audioId);
}

export function getNotificationDisplayTimestamp(
  notification: Pick<NotificationRecord, 'audioId' | 'createdAt' | 'audioTimestamp'>,
  audioTimestamps: ReadonlyMap<string, string>,
  resolvedAudioIds?: ReadonlySet<string>,
): string | undefined {
  if (notification.audioId) {
    const fromCache = audioTimestamps.get(notification.audioId);
    if (fromCache) {
      return fromCache;
    }

    if (notification.audioTimestamp) {
      return notification.audioTimestamp;
    }

    if (
      isNotificationAudioTimestampPending(
        notification,
        audioTimestamps,
        resolvedAudioIds,
      )
    ) {
      return undefined;
    }
  }

  return notification.createdAt;
}

const getNotificationSortTimestampMs = (
  notification: NotificationRecord,
  audioTimestamps: ReadonlyMap<string, string>,
  resolvedAudioIds?: ReadonlySet<string>,
): number => {
  const timestamp = getNotificationDisplayTimestamp(
    notification,
    audioTimestamps,
    resolvedAudioIds,
  );

  if (timestamp) {
    return notificationCreatedAtMs(timestamp) ?? 0;
  }

  return notificationCreatedAtMs(notification.createdAt) ?? 0;
};

export function sortNotificationsUnreadFirst(
  notifications: NotificationRecord[],
  audioTimestamps: ReadonlyMap<string, string>,
  resolvedAudioIds?: ReadonlySet<string>,
): NotificationRecord[] {
  return [...notifications].sort((a, b) => {
    const readDiff = Number(a.read) - Number(b.read);
    if (readDiff !== 0) {
      return readDiff;
    }

    const aMs = getNotificationSortTimestampMs(
      a,
      audioTimestamps,
      resolvedAudioIds,
    );
    const bMs = getNotificationSortTimestampMs(
      b,
      audioTimestamps,
      resolvedAudioIds,
    );

    return bMs - aMs;
  });
}

export function seedNotificationAudioTimestamps(
  notifications: NotificationRecord[],
  cache: Map<string, string>,
): boolean {
  let added = false;

  for (const notification of notifications) {
    if (
      notification.audioId &&
      notification.audioTimestamp &&
      !cache.has(notification.audioId)
    ) {
      cache.set(notification.audioId, notification.audioTimestamp);
      added = true;
    }
  }

  return added;
}

export async function hydrateNotificationAudioTimestamps(
  token: string,
  notifications: NotificationRecord[],
  cache: Map<string, string>,
): Promise<{added: boolean; resolvedIds: string[]}> {
  const missingIds = [
    ...new Set(
      notifications
        .map(notification => notification.audioId)
        .filter((id): id is string => !!id && !cache.has(id)),
    ),
  ];

  if (missingIds.length === 0) {
    return {added: false, resolvedIds: []};
  }

  const results = await Promise.allSettled(
    missingIds.map(id => getAudioById(token, id)),
  );

  let added = false;
  results.forEach((result, index) => {
    if (result.status !== 'fulfilled') {
      return;
    }

    const timestamp = result.value.timestamp;
    if (timestamp) {
      cache.set(missingIds[index], timestamp);
      added = true;
    }
  });

  return {added, resolvedIds: missingIds};
}
