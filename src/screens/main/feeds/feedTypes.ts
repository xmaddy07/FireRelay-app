export type FeedKeywordMatch = {
  keyword: string;
  severity: string;
};

export type FeedItem = {
  id: string;
  county: string;
  countyId?: string;
  talkgroup: string;
  talkgroupId: string;
  date: string;
  time: string;
  timestamp?: string;
  snippet: string;
  highlightKeywords: string[];
  matchedKeywords: FeedKeywordMatch[];
  maxSeverityLabel: string;
  type: 'fire' | 'medical' | 'police' | 'general';
  severity: 'critical' | 'warning' | 'info';
  starred: boolean;
  hasWarning: boolean;
  hasSecure: boolean;
  audioFilename?: string;
  audioUrl?: string;
  confidence?: number;
};

export type FeedMetadataView = {
  confidencePercent: number;
  channelId: string;
  talkgroup: string;
  county: string;
  maxSeverityLabel: string;
  maxSeverityTone: FeedItem['severity'];
  createdAtLabel: string;
  matchedKeywords: FeedKeywordMatch[];
};

export type FeedDetailData = {
  title: string;
  talkgroupShort: string;
  priority: string;
  confidencePercent: number;
};

const priorityForSeverity = (severity: FeedItem['severity']) => {
  if (severity === 'critical') return 'High';
  if (severity === 'warning') return 'Medium';
  return 'Normal';
};

const confidenceForItem = (item: FeedItem) => {
  if (typeof item.confidence === 'number') {
    const percent =
      item.confidence <= 1
        ? Math.round(item.confidence * 100)
        : Math.round(item.confidence);
    return Math.min(100, Math.max(0, percent));
  }
  let hash = 0;
  for (let i = 0; i < item.id.length; i += 1) {
    hash = (hash << 5) - hash + item.id.charCodeAt(i);
    hash |= 0;
  }
  return 28 + (Math.abs(hash) % 58);
};

const titleForItem = (item: FeedItem) => {
  if (item.type === 'fire' && item.severity === 'critical') {
    return 'Residential Structure Fire';
  }
  if (item.type === 'medical') {
    return 'Medical Emergency Response';
  }
  if (item.type === 'police') {
    return 'Law Enforcement Incident';
  }
  if (item.highlightKeywords.length > 0) {
    const keyword = item.highlightKeywords[0];
    return keyword.charAt(0).toUpperCase() + keyword.slice(1);
  }
  return `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)} Dispatch Alert`;
};

const talkgroupShortForItem = (item: FeedItem) => {
  const firstToken = item.talkgroup.split(/[\s.]+/).find(Boolean);
  if (!firstToken) return item.talkgroupId;
  return firstToken.length > 8
    ? firstToken.slice(0, 8).toUpperCase()
    : firstToken.toUpperCase();
};

export const buildFeedDetail = (item: FeedItem): FeedDetailData => ({
  title: titleForItem(item),
  talkgroupShort: talkgroupShortForItem(item),
  priority: priorityForSeverity(item.severity),
  confidencePercent: confidenceForItem(item),
});

const formatSeverityLabel = (raw?: string, fallback?: FeedItem['severity']) => {
  const value = (raw ?? '').trim().toUpperCase();
  if (value.includes('CRITICAL') || value.includes('HIGH')) {
    return 'High';
  }
  if (value.includes('MEDIUM') || value.includes('WARNING')) {
    return 'Medium';
  }
  if (value.includes('LOW')) {
    return 'Low';
  }
  if (fallback) {
    return priorityForSeverity(fallback);
  }
  return 'Normal';
};

const formatCreatedLabel = (item: FeedItem) => {
  if (item.timestamp) {
    const parsed = new Date(item.timestamp);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  }
  return `${item.date} ${item.time}`;
};

const countyDisplayName = (county: string) =>
  county.replace(/\s+county\b/i, '').trim() || county;

export const buildFeedMetadata = (item: FeedItem): FeedMetadataView => ({
  confidencePercent: confidenceForItem(item),
  channelId: item.talkgroupId,
  talkgroup: item.talkgroup,
  county: countyDisplayName(item.county),
  maxSeverityLabel: item.maxSeverityLabel,
  maxSeverityTone: item.severity,
  createdAtLabel: formatCreatedLabel(item),
  matchedKeywords:
    item.matchedKeywords.length > 0
      ? item.matchedKeywords
      : item.highlightKeywords.map(keyword => ({
          keyword,
          severity: item.maxSeverityLabel,
        })),
});
