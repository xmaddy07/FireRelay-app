import type {KeywordSearchParams} from '../../api/types/keyword';
import {normalizeKeywordSeverity} from './severityStyles';
import {
  DEFAULT_KEYWORD_FILTERS,
  KEYWORD_SEVERITY_LEVELS,
  type KeywordFilters,
  type KeywordRecord,
  type KeywordSeverityFilter,
} from './types';

export const isDefaultKeywordFilters = (filters: KeywordFilters) =>
  filters.status === DEFAULT_KEYWORD_FILTERS.status &&
  filters.severity === DEFAULT_KEYWORD_FILTERS.severity;

export const getKeywordSeverityFilterOptions = (
  items: KeywordRecord[],
): KeywordSeverityFilter[] => {
  const present = new Set(
    items
      .map(item => normalizeKeywordSeverity(item.severity))
      .filter((severity): severity is NonNullable<typeof severity> => !!severity),
  );
  const ordered = KEYWORD_SEVERITY_LEVELS.filter(level => present.has(level));
  const levels = ordered.length > 0 ? ordered : [...KEYWORD_SEVERITY_LEVELS];
  return ['All', ...levels];
};

export const keywordFiltersToSearchParams = (
  filters: KeywordFilters,
): Pick<KeywordSearchParams, 'severity' | 'active'> => {
  const params: Pick<KeywordSearchParams, 'severity' | 'active'> = {};

  if (filters.status === 'Active') {
    params.active = true;
  } else if (filters.status === 'Non-active') {
    params.active = false;
  }

  if (filters.severity !== 'All') {
    const severity = normalizeKeywordSeverity(filters.severity);
    if (severity) {
      params.severity = severity;
    }
  }

  return params;
};
