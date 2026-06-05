import type {KeywordRecord} from '../../screens/main/keyword/types';
import type {ApiKeyword} from '../types/keyword';
import {
  formatSeverityLabel,
  KEYWORD_SEVERITY_LEVELS,
  type KeywordSeverity,
} from '../types/severity';
import {pickBoolean, pickString} from '../utils';

const normalizeSeverity = (
  value: string | undefined,
): KeywordRecord['severity'] => {
  if (!value?.trim()) {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if ((KEYWORD_SEVERITY_LEVELS as readonly string[]).includes(normalized)) {
    return normalized as KeywordSeverity;
  }
  return formatSeverityLabel(normalized);
};

const mapDescriptionLevel = (
  severity: KeywordRecord['severity'],
): KeywordRecord['descriptionLevel'] => {
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    return 'critical';
  }
  return 'normal';
};

export const mapKeywordToRecord = (keyword: ApiKeyword): KeywordRecord => {
  const record = keyword as Record<string, unknown>;
  const name =
    pickString(record, ['keyword', 'name', 'text']) ?? 'Untitled';
  const description = pickString(record, ['description']) ?? '';
  const severity = normalizeSeverity(
    pickString(record, ['severity', 'priority', 'level']),
  );
  const descriptionLevel = mapDescriptionLevel(severity);

  return {
    id: keyword.id,
    name,
    active: pickBoolean(record, ['active', 'isActive']) ?? true,
    description: description || '—',
    descriptionLevel,
    severity,
    createdAt:
      pickString(record, ['createdAt', 'created_at']) ??
      new Date().toISOString(),
    isCritical: descriptionLevel === 'critical',
  };
};

export const mapRecordToCreatePayload = (keyword: KeywordRecord) => ({
  keyword: keyword.name,
  active: keyword.active,
  description: keyword.description === '—' ? null : keyword.description,
  severity: keyword.severity,
});

export const mapRecordToUpdatePayload = (keyword: KeywordRecord) =>
  mapRecordToCreatePayload(keyword);
