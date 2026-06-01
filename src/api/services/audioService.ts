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
  });

export type AudioSearchResult = {
  items: FeedItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  totalFromApi: boolean;
};

export async function searchAudioWithPagination(
  token: string,
  params: AudioSearchParams = {},
): Promise<AudioSearchResult> {
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
}

export async function searchAudio(
  token: string,
  params: AudioSearchParams = {},
): Promise<FeedItem[]> {
  const favoriteIds = await getFavoriteAudioIds(token).catch(() => new Set<string>());
  const query = buildAudioSearchQuery(params);
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.audio.searchPaginated}${query}`,
  );
  const items = unwrapList<ApiAudio>(payload);

  return items.map(item => mapAudioToFeedItem(item, favoriteIds));
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
