import {endpoints} from '../endpoints';
import {mapAudioToFeedItem} from '../mappers/audioMapper';
import type {FeedItem} from '../../screens/main/feeds/feedTypes';
import type {ApiAudio, AudioSearchParams} from '../types/audio';
import {authorizedRequest, buildQuery, unwrapList, unwrapPaginated} from '../utils';
import {getFavoriteAudioIds} from './audioFavoriteService';

const buildAudioSearchQuery = (params: AudioSearchParams) =>
  buildQuery({
    page: params.page,
    limit: params.limit,
    search: params.search,
    county: params.county ?? params.counties,
    keywords: params.keywords ?? params.keyword,
    talkgroup: params.talkgroup,
    dateFrom: params.fromDate,
    dateTo: params.toDate,
    flagged: params.flagged === true ? 'true' : undefined,
  });

export const parseCountyFilter = (params: AudioSearchParams): string[] => {
  const raw = params.county ?? params.counties;
  if (!raw?.trim()) {
    return [];
  }
  return [...new Set(raw.split(',').map(name => name.trim()).filter(Boolean))];
};

const paramsForSingleCounty = (
  params: AudioSearchParams,
  countyName: string,
): AudioSearchParams => ({
  ...params,
  county: countyName,
  counties: countyName,
});

const getFeedSortTimestamp = (item: FeedItem): number => {
  const dateParts = item.date.split('/').map(Number);
  if (dateParts.length !== 3) {
    return 0;
  }
  const [month, day, year] = dateParts;
  const timeParts = item.time.split(':').map(Number);
  const parsed = new Date(
    year,
    month - 1,
    day,
    timeParts[0] ?? 0,
    timeParts[1] ?? 0,
    timeParts[2] ?? 0,
  );
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const mergeFeedItems = (batches: FeedItem[][]): FeedItem[] => {
  const byId = new Map<string, FeedItem>();
  batches.flat().forEach(item => {
    byId.set(item.id, item);
  });
  return Array.from(byId.values()).sort(
    (a, b) => getFeedSortTimestamp(b) - getFeedSortTimestamp(a),
  );
};

export type AudioSearchResult = {
  items: FeedItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  totalFromApi: boolean;
};

const resolveFavoriteIds = (
  token: string,
  favoriteIds?: Set<string>,
): Promise<Set<string>> =>
  favoriteIds
    ? Promise.resolve(favoriteIds)
    : getFavoriteAudioIds(token).catch(() => new Set<string>());

const fetchAudioSearchPaginated = async (
  token: string,
  params: AudioSearchParams,
  favoriteIds?: Set<string>,
): Promise<AudioSearchResult> => {
  const query = buildAudioSearchQuery(params);
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  // Favorites + search in parallel — favorites must never block the page fetch.
  const [resolvedFavorites, payload] = await Promise.all([
    resolveFavoriteIds(token, favoriteIds),
    authorizedRequest<unknown>(
      token,
      `${endpoints.audio.searchPaginated}${query}`,
    ),
  ]);

  const paginated = unwrapPaginated<ApiAudio>(payload, page, limit);

  return {
    ...paginated,
    items: paginated.items.map(item =>
      mapAudioToFeedItem(item, resolvedFavorites),
    ),
  };
};

export async function searchAudioWithPagination(
  token: string,
  params: AudioSearchParams = {},
): Promise<AudioSearchResult> {
  const countyNames = parseCountyFilter(params);
  const singleParams =
    countyNames.length === 1
      ? paramsForSingleCounty(params, countyNames[0])
      : params;

  // One paginated request (comma-joined counties when multiple are selected).
  return fetchAudioSearchPaginated(token, singleParams);
}

export async function searchAudio(
  token: string,
  params: AudioSearchParams = {},
): Promise<FeedItem[]> {
  const result = await searchAudioWithPagination(token, params);
  return result.items;
}

export async function getAudioById(
  token: string,
  id: string,
): Promise<FeedItem> {
  const [favoriteIds, audio] = await Promise.all([
    getFavoriteAudioIds(token).catch(() => new Set<string>()),
    authorizedRequest<ApiAudio>(token, endpoints.audio.byId(id)),
  ]);
  return mapAudioToFeedItem(audio, favoriteIds);
}

export async function getAudioContext(token: string, id: string) {
  return authorizedRequest<unknown>(token, endpoints.audio.context(id));
}

export async function getLatestAudioTimestampForCountyId(
  token: string,
  countyId: string,
): Promise<string | null> {
  const query = buildQuery({page: 1, limit: 1});
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.audio.byCountyIdPaginated(countyId)}${query}`,
  );
  const paginated = unwrapPaginated<ApiAudio>(payload, 1, 1);
  const latest = paginated.items[0];
  if (!latest) {
    return null;
  }
  const record = latest as Record<string, unknown>;
  const timestamp =
    (typeof record.timestamp === 'string' && record.timestamp) ||
    (typeof record.createdAt === 'string' && record.createdAt) ||
    (typeof record.recordedAt === 'string' && record.recordedAt) ||
    null;
  return timestamp;
}

export async function getLatestAudioForCountyId(
  token: string,
  countyId: string,
): Promise<FeedItem | null> {
  const favoriteIds = await getFavoriteAudioIds(token).catch(
    () => new Set<string>(),
  );
  const query = buildQuery({page: 1, limit: 1});
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.audio.byCountyIdPaginated(countyId)}${query}`,
  );
  const paginated = unwrapPaginated<ApiAudio>(payload, 1, 1);
  const latest = paginated.items[0];
  if (!latest) {
    return null;
  }
  return mapAudioToFeedItem(latest, favoriteIds);
}
