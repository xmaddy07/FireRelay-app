import {storageKeys} from '../../config/constants/storageKeys';
import {storageService} from './storageService';

export type StoredFeedFilters = {
  counties: string[];
  keywords: string;
  talkgroup: string;
  fromDate: string;
  toDate: string;
  alertStatus: 'All' | 'Flagged';
};

const storageKeyForUser = (userKey: string) =>
  `${storageKeys.feedFilters}:${userKey}`;

const isStoredFeedFilters = (value: unknown): value is StoredFeedFilters => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    Array.isArray(record.counties) &&
    typeof record.keywords === 'string' &&
    typeof record.talkgroup === 'string' &&
    typeof record.fromDate === 'string' &&
    typeof record.toDate === 'string' &&
    (record.alertStatus === 'All' || record.alertStatus === 'Flagged')
  );
};

export async function loadFeedFilters(
  userKey: string,
): Promise<StoredFeedFilters | null> {
  try {
    const raw = await storageService.get(storageKeyForUser(userKey));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isStoredFeedFilters(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveFeedFilters(
  userKey: string,
  filters: StoredFeedFilters | null,
): Promise<void> {
  const key = storageKeyForUser(userKey);
  if (!filters) {
    await storageService.remove(key);
    return;
  }
  await storageService.set(key, JSON.stringify(filters));
}
