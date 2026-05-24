import type {KeywordFilters, KeywordRecord} from './types';
import {DEFAULT_KEYWORD_FILTERS} from './types';

export const isDefaultKeywordFilters = (filters: KeywordFilters) =>
  filters.status === DEFAULT_KEYWORD_FILTERS.status &&
  filters.severity === DEFAULT_KEYWORD_FILTERS.severity;

export const applyKeywordFilters = (
  items: KeywordRecord[],
  filters: KeywordFilters,
): KeywordRecord[] => {
  if (isDefaultKeywordFilters(filters)) {
    return items;
  }

  return items.filter(item => {
    if (filters.status === 'Active' && !item.active) {
      return false;
    }
    if (filters.status === 'Non-active' && item.active) {
      return false;
    }
    if (filters.severity !== 'All') {
      const severity = item.severity?.toUpperCase() ?? '';
      if (severity !== filters.severity) {
        return false;
      }
    }
    return true;
  });
};
