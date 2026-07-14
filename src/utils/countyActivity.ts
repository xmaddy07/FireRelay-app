import type {CountyActivityView} from '../api/types/county';

export const COUNTY_SHIELD_COLORS = [
  '#7C3AED',
  '#EA580C',
  '#DB2777',
  '#2563EB',
  '#CA8A04',
  '#059669',
];

export const countyShieldColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return COUNTY_SHIELD_COLORS[Math.abs(hash) % COUNTY_SHIELD_COLORS.length];
};

export const countyAvatarColor = (seed: string) => countyShieldColor(seed);

export const emailInitials = (email: string) => {
  const local = email.split('@')[0]?.trim() ?? '';
  if (!local) {
    return '?';
  }
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
};

export const COUNTY_LIVE_NOW_MS = 2 * 60 * 1000;
export const COUNTY_ACTIVE_WINDOW_MS = 15 * 60 * 1000;

export const abbreviateCountyCode = (name: string): string => {
  const words = name
    .trim()
    .replace(/\bcounty\b/gi, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }
  return words
    .map(word => word[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();
};

export const resolveCountyCode = (name: string, code?: string | null): string => {
  const trimmed = code?.trim();
  if (trimmed) {
    return trimmed;
  }
  return abbreviateCountyCode(name);
};

export const countyShieldInitials = (
  name: string,
  code?: string | null,
): string => {
  const resolved = resolveCountyCode(name, code);
  if (!resolved) {
    return '?';
  }
  return resolved.slice(0, 2).toUpperCase();
};

export const isCountyOnline = (
  status: CountyActivityView['status'],
): boolean => status === 'live' || status === 'active';

export const formatCountyLocationLabel = (
  code?: string | null,
  state?: string | null,
  countyName?: string,
): string => {
  const codeLabel = resolveCountyCode(countyName ?? '', code);
  const stateLabel = state?.trim();
  if (codeLabel && stateLabel) {
    return `${codeLabel} • ${stateLabel}`;
  }
  if (codeLabel) {
    return codeLabel;
  }
  if (stateLabel) {
    return stateLabel;
  }
  return '—';
};

export const formatCountyLastActiveLabel = (
  iso?: string | null,
  nowMs = Date.now(),
): string => {
  if (!iso) {
    return 'No activity';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'No activity';
  }

  const diffMs = Math.max(0, nowMs - date.getTime());
  if (diffMs < 60_000) {
    return 'Just now';
  }
  const minutes = Math.floor(diffMs / 60_000);
  if (diffMs < 3_600_000) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(diffMs / 3_600_000);
  if (diffMs < 86_400_000) {
    return `${hours}h ago`;
  }
  const days = Math.floor(diffMs / 86_400_000);
  return `${days}d ago`;
};

export const deriveCountyActivity = (
  lastActiveAt: string | null | undefined,
  nowMs = Date.now(),
): CountyActivityView => {
  if (!lastActiveAt) {
    return {
      status: 'offline',
      badgeLabel: 'Offline',
      lastActiveLabel: 'No activity',
    };
  }

  const timestamp = new Date(lastActiveAt).getTime();
  if (Number.isNaN(timestamp)) {
    return {
      status: 'offline',
      badgeLabel: 'Offline',
      lastActiveLabel: 'No activity',
    };
  }

  const diffMs = Math.max(0, nowMs - timestamp);
  const lastActiveLabel = formatCountyLastActiveLabel(lastActiveAt, nowMs);

  if (diffMs < COUNTY_LIVE_NOW_MS) {
    return {
      status: 'live',
      badgeLabel: 'Live now',
      lastActiveLabel,
    };
  }

  if (diffMs < COUNTY_ACTIVE_WINDOW_MS) {
    const minutes = Math.max(1, Math.floor(diffMs / 60_000));
    return {
      status: 'active',
      badgeLabel: `Active ${minutes}m ago`,
      lastActiveLabel,
    };
  }

  return {
    status: 'offline',
    badgeLabel: 'Offline',
    lastActiveLabel,
  };
};

export const pickLatestTimestamp = (
  current: string | null | undefined,
  candidate: string | null | undefined,
): string | null => {
  if (!candidate) {
    return current ?? null;
  }
  if (!current) {
    return candidate;
  }
  const currentMs = new Date(current).getTime();
  const candidateMs = new Date(candidate).getTime();
  if (Number.isNaN(candidateMs)) {
    return current;
  }
  if (Number.isNaN(currentMs) || candidateMs > currentMs) {
    return candidate;
  }
  return current;
};
