import type {ApiNotification} from '../types/notification';
import {notificationCreatedAtMs} from '../../utils/notificationTime';
import {pickString} from '../utils';

export type NotifSeverity = 'structure_fire' | 'bell' | 'alert' | 'info';

export type NotificationRecord = {
  id: string;
  audioId?: string;
  audioTimestamp?: string;
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

const toCreatedAtIso = (value: unknown): string | undefined => {
  const ms = notificationCreatedAtMs(
    typeof value === 'string' || typeof value === 'number' || value instanceof Date
      ? value
      : null,
  );
  return ms == null ? undefined : new Date(ms).toISOString();
};

const pickAudioTimestamp = (
  record: Record<string, unknown>,
): string | undefined => {
  const audio = toRecord(record.audio);
  if (!audio) {
    return undefined;
  }

  const timestamp = pickString(audio, [
    'timestamp',
    'createdAt',
    'created_at',
    'recordedAt',
    'recorded_at',
  ]);

  if (!timestamp) {
    return undefined;
  }

  return toCreatedAtIso(timestamp) ?? timestamp;
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
  const audioTimestamp = pickAudioTimestamp(record);

  return {
    id: notification.id,
    audioId: pickAudioId(record),
    audioTimestamp,
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
