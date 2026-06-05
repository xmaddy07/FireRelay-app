import {
  KEYWORD_SEVERITY_LEVELS,
  type KeywordSeverity,
} from '../../../api/types/severity';

export {KEYWORD_SEVERITY_LEVELS, type KeywordSeverity};

export const KEYWORDS_PAGE_SIZE = 10;

export type KeywordStatusFilter = 'All' | 'Active' | 'Non-active';

export type KeywordSeverityFilter = 'All' | KeywordSeverity;

export type KeywordFilters = {
  status: KeywordStatusFilter;
  severity: KeywordSeverityFilter;
};

export const DEFAULT_KEYWORD_FILTERS: KeywordFilters = {
  status: 'All',
  severity: 'All',
};

export const KEYWORD_STATUS_FILTER_OPTIONS: KeywordStatusFilter[] = [
  'All',
  'Active',
  'Non-active',
];

export const KEYWORD_SEVERITY_FILTER_OPTIONS: KeywordSeverityFilter[] = [
  'All',
  ...KEYWORD_SEVERITY_LEVELS,
];

export type KeywordDescriptionLevel = 'normal' | 'critical';

export type KeywordRecord = {
  id: string;
  name: string;
  active: boolean;
  description: string;
  descriptionLevel: KeywordDescriptionLevel;
  severity: KeywordSeverity | null;
  createdAt: string;
  isCritical?: boolean;
};
