import type {FeedItem} from '../../screens/main/feeds/feedTypes';
import {filterDisplayDateToApi} from '../../utils/filterDate';

export type FeedSocketFilters = {
  counties: string[];
  keywords: string;
  talkgroup: string;
  fromDate: string;
  toDate: string;
  alertStatus: 'All' | 'Flagged';
};

const DEFAULT_FILTERS: FeedSocketFilters = {
  counties: [],
  keywords: '',
  talkgroup: '',
  fromDate: '',
  toDate: '',
  alertStatus: 'All',
};

const normalize = (value: string) => value.trim().toLowerCase();

const matchesKeywordFilter = (item: FeedItem, keywords: string) => {
  const terms = keywords
    .split(',')
    .map(term => normalize(term))
    .filter(Boolean);
  if (terms.length === 0) {
    return true;
  }

  const haystack = normalize(
    `${item.snippet} ${item.highlightKeywords.join(' ')} ${item.talkgroup}`,
  );
  return terms.some(term => haystack.includes(term));
};

const matchesDateRange = (
  item: FeedItem,
  fromDate: string,
  toDate: string,
) => {
  if (!fromDate && !toDate) {
    return true;
  }

  const timestamp = item.timestamp;
  if (!timestamp) {
    return true;
  }

  const itemDate = new Date(timestamp);
  if (Number.isNaN(itemDate.getTime())) {
    return true;
  }

  const fromApi = fromDate ? filterDisplayDateToApi(fromDate) : undefined;
  const toApi = toDate ? filterDisplayDateToApi(toDate) : undefined;

  if (fromApi) {
    const from = new Date(`${fromApi}T00:00:00`);
    if (itemDate < from) {
      return false;
    }
  }

  if (toApi) {
    const to = new Date(`${toApi}T23:59:59.999`);
    if (itemDate > to) {
      return false;
    }
  }

  return true;
};

export const feedItemMatchesSocketFilters = (
  item: FeedItem,
  filters: FeedSocketFilters | null,
  searchQuery: string,
): boolean => {
  const active = filters ?? DEFAULT_FILTERS;

  if (
    active.counties.length > 0 &&
    !active.counties.some(
      county => normalize(county) === normalize(item.county),
    )
  ) {
    return false;
  }

  if (
    active.talkgroup &&
    !normalize(item.talkgroup).includes(normalize(active.talkgroup))
  ) {
    return false;
  }

  if (!matchesKeywordFilter(item, active.keywords)) {
    return false;
  }

  if (!matchesDateRange(item, active.fromDate, active.toDate)) {
    return false;
  }

  if (active.alertStatus === 'Flagged' && !item.hasWarning) {
    return false;
  }

  const query = normalize(searchQuery);
  if (query) {
    const haystack = normalize(
      `${item.snippet} ${item.talkgroup} ${item.county} ${item.highlightKeywords.join(' ')}`,
    );
    if (!haystack.includes(query)) {
      return false;
    }
  }

  return true;
};
