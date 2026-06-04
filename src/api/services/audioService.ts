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

const fetchAudioSearchPaginated = async (
  token: string,
  params: AudioSearchParams,
): Promise<AudioSearchResult> => {
  const favoriteIds = await getFavoriteAudioIds(token).catch(() => new Set<string>());
  const query = buildAudioSearchQuery(params);
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.audio.searchPaginated}${query}`,
  );

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const paginated = unwrapPaginated<ApiAudio>(payload, page, limit);

  return {
    ...paginated,
    items: paginated.items.map(item => mapAudioToFeedItem(item, favoriteIds)),
  };
};

export async function searchAudioWithPagination(
  token: string,
  params: AudioSearchParams = {},
): Promise<AudioSearchResult> {
  const countyNames = parseCountyFilter(params);

  if (countyNames.length <= 1) {
    const singleParams =
      countyNames.length === 1
        ? paramsForSingleCounty(params, countyNames[0])
        : params;
    return fetchAudioSearchPaginated(token, singleParams);
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const pages = await Promise.all(
    countyNames.map(countyName =>
      fetchAudioSearchPaginated(
        token,
        paramsForSingleCounty({...params, page: 1, limit: 1}, countyName),
      ),
    ),
  );
  const total = pages.reduce((sum, pageResult) => sum + pageResult.total, 0);

  return {
    items: [],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasMore: total > limit,
    totalFromApi: true,
  };
}

export async function searchAudio(
  token: string,
  params: AudioSearchParams = {},
): Promise<FeedItem[]> {
  const countyNames = parseCountyFilter(params);

  if (countyNames.length <= 1) {
    const singleParams =
      countyNames.length === 1
        ? paramsForSingleCounty(params, countyNames[0])
        : params;
    const result = await fetchAudioSearchPaginated(token, singleParams);
    return result.items;
  }

  const batches = await Promise.all(
    countyNames.map(countyName =>
      fetchAudioSearchPaginated(
        token,
        paramsForSingleCounty(params, countyName),
      ).then(result => result.items),
    ),
  );

  return mergeFeedItems(batches);
}

export async function getAudioById(
  token: string,
  id: string,
): Promise<FeedItem> {
  const favoriteIds = await getFavoriteAudioIds(token).catch(() => new Set<string>());
  const audio = await authorizedRequest<ApiAudio>(
    token,
    endpoints.audio.byId(id),
  );
  return mapAudioToFeedItem(audio, favoriteIds);
}

export async function getAudioContext(token: string, id: string) {
  return authorizedRequest<unknown>(token, endpoints.audio.context(id));
}
