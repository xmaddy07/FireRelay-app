export type KeywordSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export const KEYWORD_SEVERITY_LEVELS: readonly KeywordSeverity[] = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
];

export type SeverityNotificationPreference = {
  email: boolean;
  push: boolean;
};

export type NotificationPreferences = {
  CRITICAL: SeverityNotificationPreference;
  HIGH: SeverityNotificationPreference;
  MEDIUM: SeverityNotificationPreference;
  LOW: SeverityNotificationPreference;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  CRITICAL: {email: true, push: true},
  HIGH: {email: true, push: true},
  MEDIUM: {email: true, push: true},
  LOW: {email: true, push: true},
};

export const formatSeverityLabel = (raw?: string | null): KeywordSeverity => {
  const value = (raw ?? '').trim().toUpperCase();
  if (value.includes('CRITICAL')) {
    return 'CRITICAL';
  }
  if (value.includes('HIGH')) {
    return 'HIGH';
  }
  if (value.includes('MEDIUM') || value.includes('WARNING')) {
    return 'MEDIUM';
  }
  return 'LOW';
};

export const severityDisplayName = (severity: KeywordSeverity): string =>
  severity.charAt(0) + severity.slice(1).toLowerCase();
