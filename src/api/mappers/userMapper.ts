import type {
  UserPresenceStatus,
  UserRecord,
  UserRole,
} from '../../screens/main/leadLog/types';
import type {ApiCounty, ApiUser, FeedSeverityLevel} from '../types/user';
import {pickNumber, pickString} from '../utils';

export const normalizeFeedSeverityLevel = (
  value: string,
): FeedSeverityLevel | null => {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'CRITICAL') {
    return 'CRITICAL';
  }
  if (normalized === 'HIGH') {
    return 'HIGH';
  }
  if (normalized === 'MEDIUM') {
    return 'MEDIUM';
  }
  if (normalized === 'LOW') {
    return 'LOW';
  }
  return null;
};

export const parseAllowedSeverities = (
  record: Record<string, unknown>,
): FeedSeverityLevel[] | null => {
  const raw =
    record.allowedSeverities ??
    record.allowed_severities ??
    record.allowedMaxSeverities ??
    record.allowed_max_severities;

  if (raw === null || raw === undefined) {
    return null;
  }
  if (!Array.isArray(raw)) {
    return null;
  }
  if (raw.length === 0) {
    return [];
  }
  const levels = raw
    .map(item =>
      typeof item === 'string' ? normalizeFeedSeverityLevel(item) : null,
    )
    .filter((level): level is FeedSeverityLevel => Boolean(level));
  return [...new Set(levels)];
};

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const AWAY_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const derivePresenceStatus = (
  lastSeenAt: string | null,
): UserPresenceStatus => {
  if (!lastSeenAt) {
    return 'offline';
  }
  const seenAt = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seenAt)) {
    return 'offline';
  }
  const diffMs = Date.now() - seenAt;
  if (diffMs < ONLINE_THRESHOLD_MS) {
    return 'online';
  }
  if (diffMs < AWAY_THRESHOLD_MS) {
    return 'away';
  }
  return 'offline';
};

const mapRole = (role?: string): UserRole =>
  role?.toLowerCase() === 'admin' ? 'admin' : 'user';

const countyNamesFromPayload = (counties: unknown): string[] => {
  if (!Array.isArray(counties)) {
    return [];
  }

  return counties
    .map(item => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        const record = item as ApiCounty;
        return pickString(record as Record<string, unknown>, ['name', 'code']);
      }
      return undefined;
    })
    .filter((name): name is string => Boolean(name));
};

export const mapUserToRecord = (user: ApiUser): UserRecord => {
  const record = user as Record<string, unknown>;
  const lastSeenAt =
    pickString(record, ['lastSeenAt', 'last_seen_at']) ?? null;
  const activeSessionCount =
    pickNumber(record, [
      'activeSessionCount',
      'active_session_count',
      'activeSessions',
    ]) ?? 0;
  const presenceStatus = derivePresenceStatus(
    activeSessionCount > 0 ? lastSeenAt : null,
  );

  return {
    id: user.id,
    email: pickString(record, ['email']) ?? 'unknown',
    role: mapRole(pickString(record, ['role'])),
    createdAt:
      pickString(record, ['createdAt', 'created_at']) ??
      new Date().toISOString(),
    counties: countyNamesFromPayload(user.counties),
    lastSeenAt,
    activeSessionCount,
    presenceStatus,
    allowedSeverities: parseAllowedSeverities(record),
  };
};

export const mapCountyOption = (county: ApiCounty) => ({
  id: county.id,
  name: pickString(county as Record<string, unknown>, ['name']) ?? county.id,
  code: pickString(county as Record<string, unknown>, ['code']) ?? '',
  state: pickString(county as Record<string, unknown>, ['state']) ?? 'Texas',
  established:
    pickString(county as Record<string, unknown>, ['established', 'est']) ??
    '',
});
