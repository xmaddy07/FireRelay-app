import {API_BASE_URL} from '../../config/env';
import {endpoints} from '../endpoints';
import type {ApiAudio} from '../types/audio';
import {formatSeverityLabel} from '../types/severity';
import type {FeedItem, FeedKeywordMatch} from '../../screens/main/feeds/feedTypes';
import {pickBoolean, pickString} from '../utils';

type ApiCountyRef = {
  id?: string;
  name?: string;
  code?: string | null;
  state?: string | null;
};

type ApiKeywordMatch = {
  keyword?: string;
  name?: string;
  text?: string;
  severity?: string;
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap(item => {
        if (typeof item === 'string') {
          return [item];
        }
        const record = toRecord(item);
        if (!record) {
          return [];
        }
        const keyword = pickString(record, ['keyword', 'name', 'text']);
        return keyword ? [keyword] : [];
      })
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
};

const pickCountyName = (record: Record<string, unknown>): string => {
  const county = record.county;
  if (typeof county === 'string' && county.trim()) {
    return county.trim();
  }
  if (county && typeof county === 'object') {
    const countyRecord = county as ApiCountyRef;
    if (typeof countyRecord.name === 'string' && countyRecord.name.trim()) {
      return countyRecord.name.trim();
    }
  }
  return pickString(record, ['countyName']) ?? 'Unknown';
};

const pickCountyId = (record: Record<string, unknown>): string | undefined => {
  const county = record.county;
  if (county && typeof county === 'object') {
    const countyRecord = county as ApiCountyRef;
    if (typeof countyRecord.id === 'string') {
      return countyRecord.id;
    }
  }
  return undefined;
};

const formatDateParts = (iso?: string) => {
  if (!iso) {
    return {date: '—', time: '—'};
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return {date: '—', time: '—'};
  }
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  const seconds = String(parsed.getSeconds()).padStart(2, '0');
  return {
    date: `${month}/${day}/${year}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
};

const mapSeverity = (record: Record<string, unknown>): FeedItem['severity'] => {
  const priority = (
    pickString(record, [
      'maxSeverity',
      'severity',
      'priority',
      'keywordPriority',
    ]) ?? ''
  ).toUpperCase();

  if (
    priority.includes('CRITICAL') ||
    priority.includes('HIGH')
  ) {
    return 'critical';
  }
  if (priority.includes('MEDIUM') || priority.includes('WARNING')) {
    return 'warning';
  }
  return 'info';
};

const mapType = (
  record: Record<string, unknown>,
  talkgroup: string,
  highlightKeywords: string[],
): FeedItem['type'] => {
  const raw = (
    pickString(record, ['type', 'category']) ?? ''
  ).toLowerCase();
  const combined = `${raw} ${talkgroup.toLowerCase()} ${highlightKeywords.join(' ').toLowerCase()}`;

  if (combined.includes('medical') || combined.includes('medic')) {
    return 'medical';
  }
  if (
    combined.includes('police') ||
    combined.includes('law') ||
    combined.includes('sheriff')
  ) {
    return 'police';
  }
  if (
    combined.includes('fire') ||
    combined.includes('smoke') ||
    combined.includes('explosion') ||
    combined.includes('emergency')
  ) {
    return 'fire';
  }
  return 'general';
};

const resolveAudioSource = (record: Record<string, unknown>) => {
  const path = pickString(record, ['path']);
  if (path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const audioUrl = path.startsWith('http')
      ? path
      : `${API_BASE_URL}${normalizedPath}`;
    const fileMatch = normalizedPath.match(/\/audio\/file\/(.+)$/);
    return {
      audioUrl,
      audioFilename: fileMatch?.[1],
    };
  }

  const filename =
    pickString(record, ['filename', 'fileName', 'audioFile']) ?? undefined;
  return {
    audioUrl: filename ? `${API_BASE_URL}${endpoints.audio.file(filename)}` : undefined,
    audioFilename: filename,
  };
};

const formatMatchSeverity = (raw?: string) => formatSeverityLabel(raw);

const collectKeywordMatches = (
  record: Record<string, unknown>,
): FeedKeywordMatch[] => {
  const matches = record.keywordMatches;
  if (!Array.isArray(matches)) {
    return [];
  }

  const parsed = matches
    .map(entry => {
      const matchRecord = toRecord(entry);
      if (!matchRecord) {
        return null;
      }
      const keyword = pickString(matchRecord, ['keyword', 'name', 'text']);
      if (!keyword) {
        return null;
      }
      return {
        keyword: keyword.trim(),
        severity: formatMatchSeverity(
          pickString(matchRecord, ['severity', 'priority', 'level', 'maxSeverity']),
        ),
      };
    })
    .filter((entry): entry is FeedKeywordMatch => Boolean(entry));

  const seen = new Set<string>();
  return parsed.filter(entry => {
    const key = `${entry.keyword.toLowerCase()}|${entry.severity}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const collectHighlightKeywords = (record: Record<string, unknown>): string[] => {
  const fromKeywords = toStringArray(record.keywords);
  const fromMatches = collectKeywordMatches(record).map(match => match.keyword);
  const merged = [...fromKeywords, ...fromMatches];
  return [...new Set(merged.map(keyword => keyword.trim()).filter(Boolean))];
};

const pickMaxSeverityLabel = (record: Record<string, unknown>) =>
  formatMatchSeverity(
    pickString(record, ['maxSeverity', 'severity', 'priority', 'keywordPriority']),
  );

export const getAudioFileUrl = (filename: string) =>
  `${API_BASE_URL}${endpoints.audio.file(filename)}`;

export const mapAudioToFeedItem = (
  audio: ApiAudio,
  favoriteIds?: Set<string>,
): FeedItem => {
  const record = audio as Record<string, unknown>;
  const timestamp =
    pickString(record, ['timestamp', 'createdAt', 'recordedAt']) ?? undefined;
  const {date, time} = formatDateParts(timestamp);
  const matchedKeywords = collectKeywordMatches(record);
  const highlightKeywords = collectHighlightKeywords(record);
  const maxSeverityLabel = pickMaxSeverityLabel(record);
  const talkgroup =
    pickString(record, ['talkgroup', 'talkGroup']) ?? 'Unknown';
  const talkgroupId =
    pickString(record, ['talkgroupID', 'talkgroupId', 'talkGroupId']) ?? '—';
  const {audioUrl, audioFilename} = resolveAudioSource(record);
  const starred =
    favoriteIds?.has(audio.id) ||
    pickBoolean(record, ['starred', 'isFavorite', 'isFavorited']) ||
    false;
  const confidenceRaw = record.confidence;
  const confidence =
    typeof confidenceRaw === 'number' && Number.isFinite(confidenceRaw)
      ? confidenceRaw
      : undefined;

  return {
    id: audio.id,
    county: pickCountyName(record),
    countyId: pickCountyId(record),
    talkgroup,
    talkgroupId,
    date,
    time,
    timestamp,
    snippet:
      pickString(record, [
        'transcription',
        'snippet',
        'transcript',
        'text',
      ]) ?? '',
    highlightKeywords,
    matchedKeywords,
    maxSeverityLabel,
    type: mapType(record, talkgroup, highlightKeywords),
    severity: mapSeverity(record),
    starred,
    hasWarning:
      pickBoolean(record, ['hasWarning', 'flagged']) ??
      highlightKeywords.length > 0,
    hasSecure: pickBoolean(record, ['hasSecure']) ?? false,
    audioFilename,
    audioUrl,
    confidence,
  };
};
