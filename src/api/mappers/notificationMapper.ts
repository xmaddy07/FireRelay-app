import type {ApiNotification} from '../types/notification';
import {pickString} from '../utils';

export type NotifSeverity = 'structure_fire' | 'bell' | 'alert' | 'info';

export type NotificationRecord = {
  id: string;
  audioId?: string;
  severity: NotifSeverity;
  county: string;
  talkgroup: string;
  createdAt?: string;
  message: string;
  read: boolean;
  channel?: 'email' | 'push';
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const mapSeverity = (raw?: string | null): NotifSeverity => {
  const value = (raw ?? '').trim().toLowerCase();
  if (!value) {
    return 'info';
  }
  if (
    value.includes('structure') ||
    value.includes('critical') ||
    value === 'structure_fire'
  ) {
    return 'structure_fire';
  }
  if (value.includes('high') || value.includes('fire') || value === 'bell') {
    return 'bell';
  }
  if (
    value.includes('medium') ||
    value.includes('alert') ||
    value.includes('warning')
  ) {
    return 'alert';
  }
  return 'info';
};

const parseNotificationDate = (value: unknown): Date | null => {
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value.trim());
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const parsed = new Date(ms);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

/** Relative label from notification `createdAt` only — not readAt/updatedAt. */
export const formatTimeAgo = (
  iso?: string | null,
  nowMs = Date.now(),
): string => {
  if (!iso) {
    return '—';
  }

  const date = parseNotificationDate(iso);
  if (!date) {
    return '—';
  }

  const elapsedMs = Math.abs(nowMs - date.getTime());
  if (elapsedMs < 60_000) {
    return 'Just now';
  }

  const minutes = Math.floor(elapsedMs / 60_000);
  if (elapsedMs < 3_600_000) {
    return minutes === 1 ? '1 min ago' : `${minutes} min ago`;
  }

  const hours = Math.floor(elapsedMs / 3_600_000);
  if (elapsedMs < 86_400_000) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }

  const days = Math.floor(elapsedMs / 86_400_000);
  if (elapsedMs < 604_800_000) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  const weeks = Math.floor(elapsedMs / 604_800_000);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
};

const pickTalkgroup = (record: Record<string, unknown>): string => {
  const direct = pickString(record, ['talkgroup', 'talkGroup', 'talk_group']);
  if (direct) {
    return direct;
  }

  const metadata = toRecord(record.metadata);
  if (metadata) {
    const fromMeta = pickString(metadata, ['talkgroup', 'talkGroup', 'talk_group']);
    if (fromMeta) {
      return fromMeta;
    }
  }

  const audio = toRecord(record.audio);
  if (audio) {
    return pickString(audio, ['talkgroup', 'talkGroup', 'talk_group']) ?? '';
  }

  return '';
};

const pickCounty = (record: Record<string, unknown>): string => {
  const county = record.county;
  if (typeof county === 'string' && county.trim()) {
    return county.trim();
  }
  if (county && typeof county === 'object') {
    const countyRecord = county as Record<string, unknown>;
    const name = pickString(countyRecord, ['name', 'countyName']);
    if (name) {
      return name;
    }
  }

  const title = pickString(record, ['title']);
  if (title) {
    return title;
  }

  return 'Alert';
};

const pickMessage = (record: Record<string, unknown>): string => {
  const message = pickString(record, ['message', 'body', 'content', 'text']);
  if (message) {
    return message;
  }

  const metadata = toRecord(record.metadata);
  if (metadata) {
    const fromMeta = pickString(metadata, ['message', 'body', 'content', 'text']);
    if (fromMeta) {
      return fromMeta;
    }
  }

  const audio = toRecord(record.audio);
  if (audio) {
    const fromAudio = pickString(audio, [
      'transcription',
      'transcript',
      'message',
      'body',
      'text',
    ]);
    if (fromAudio) {
      return fromAudio;
    }
  }

  return '';
};

const pickAudioId = (record: Record<string, unknown>): string | undefined => {
  const direct = pickString(record, ['audioId', 'audio_id', 'resourceId', 'resource_id']);
  if (direct) {
    return direct;
  }

  const metadata = toRecord(record.metadata);
  if (metadata) {
    const fromMeta = pickString(metadata, ['audioId', 'audio_id']);
    if (fromMeta) {
      return fromMeta;
    }
  }

  const audio = toRecord(record.audio);
  if (audio && typeof audio.id === 'string' && audio.id.trim()) {
    return audio.id.trim();
  }

  return undefined;
};

const isRead = (record: Record<string, unknown>): boolean => {
  const readAt = pickString(record, ['readAt', 'read_at']);
  if (readAt) {
    return true;
  }
  if (record.read === true || record.isRead === true || record.is_read === true) {
    return true;
  }
  return false;
};

const toCreatedAtIso = (value: unknown): string | undefined => {
  const parsed = parseNotificationDate(value);
  return parsed ? parsed.toISOString() : undefined;
};

const pickCreatedAt = (record: Record<string, unknown>): string | undefined => {
  for (const key of ['createdAt', 'created_at']) {
    const iso = toCreatedAtIso(record[key]);
    if (iso) {
      return iso;
    }
  }
  return undefined;
};

export const normalizeApiNotification = (
  item: unknown,
): ApiNotification | null => {
  const record = toRecord(item);
  if (!record) {
    return null;
  }

  const nested = toRecord(record.notification);
  if (nested) {
    return {...nested, ...record} as ApiNotification;
  }

  return record as ApiNotification;
};

export const mapNotificationToRecord = (
  notification: ApiNotification,
): NotificationRecord => {
  const record = notification as Record<string, unknown>;
  const createdAt = pickCreatedAt(record);

  return {
    id: notification.id,
    audioId: pickAudioId(record),
    severity: mapSeverity(
      pickString(record, ['severity', 'priority', 'level', 'type']),
    ),
    county: pickCounty(record),
    talkgroup: pickTalkgroup(record),
    createdAt,
    message: pickMessage(record),
    read: isRead(record),
    channel:
      notification.channel === 'email' || notification.channel === 'push'
        ? notification.channel
        : undefined,
  };
};
