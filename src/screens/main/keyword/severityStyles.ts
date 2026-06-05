import type {createStyles} from './styles';
import type {createKeywordModalStyles} from './keywordModal.styles';
import {KEYWORD_SEVERITY_LEVELS, type KeywordSeverity} from './types';

export type KeywordSeverityTone =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'default';

export const getKeywordSeverityTone = (
  severity: KeywordSeverity | null | undefined,
): KeywordSeverityTone => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'MEDIUM':
      return 'medium';
    case 'LOW':
      return 'low';
    default:
      return 'default';
  }
};

export const normalizeKeywordSeverity = (
  severity: KeywordSeverity | null | undefined,
): KeywordSeverity | null => {
  if (!severity) {
    return null;
  }
  const normalized = severity.toUpperCase();
  return (KEYWORD_SEVERITY_LEVELS as readonly string[]).includes(normalized)
    ? (normalized as KeywordSeverity)
    : null;
};

export const getListSeverityStyles = (
  severity: KeywordSeverity | null,
  styles: ReturnType<typeof createStyles>,
) => {
  switch (getKeywordSeverityTone(severity)) {
    case 'critical':
    case 'high':
      return {
        badge: [styles.severityBadge, styles.severityBadgeHigh],
        text: [styles.severityText, styles.severityTextHigh],
      };
    case 'medium':
      return {
        badge: [styles.severityBadge, styles.severityBadgeMedium],
        text: [styles.severityText, styles.severityTextMedium],
      };
    case 'low':
      return {
        badge: [styles.severityBadge, styles.severityBadgeLow],
        text: [styles.severityText, styles.severityTextLow],
      };
    default:
      return {
        badge: [styles.severityBadge, styles.severityBadgeDefault],
        text: [styles.severityText, styles.severityTextDefault],
      };
  }
};

export const getModalSeverityChipStyles = (
  severity: KeywordSeverity,
  selected: boolean,
  styles: ReturnType<typeof createKeywordModalStyles>,
) => {
  switch (getKeywordSeverityTone(severity)) {
    case 'critical':
      return {
        chip: [
          styles.severityChip,
          styles.severityChipCritical,
          selected && styles.severityChipCriticalActive,
          selected && styles.severityChipActive,
        ],
        text: [styles.severityChipText, styles.severityChipTextCritical],
      };
    case 'low':
      return {
        chip: [
          styles.severityChip,
          styles.severityChipLow,
          selected && styles.severityChipLowActive,
          selected && styles.severityChipActive,
        ],
        text: [styles.severityChipText, styles.severityChipTextLow],
      };
    case 'medium':
      return {
        chip: [
          styles.severityChip,
          styles.severityChipMedium,
          selected && styles.severityChipMediumActive,
          selected && styles.severityChipActive,
        ],
        text: [styles.severityChipText, styles.severityChipTextMedium],
      };
    case 'high':
      return {
        chip: [
          styles.severityChip,
          styles.severityChipHigh,
          selected && styles.severityChipHighActive,
          selected && styles.severityChipActive,
        ],
        text: [styles.severityChipText, styles.severityChipTextHigh],
      };
    default:
      return {
        chip: [styles.severityChip, selected && styles.severityChipActive],
        text: [styles.severityChipText],
      };
  }
};
