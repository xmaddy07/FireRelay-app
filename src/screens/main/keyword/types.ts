export const KEYWORDS_PAGE_SIZE = 10;

export type KeywordStatusFilter = 'All' | 'Active' | 'Non-active';

export type KeywordSeverityFilter =
  | 'All'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

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
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

export type KeywordDescriptionLevel = 'normal' | 'critical';

export type KeywordSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;

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
