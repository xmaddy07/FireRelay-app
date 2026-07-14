import {endpoints} from '../endpoints';
import {
  buildCountyListItem,
  mapCountyOption,
  mapCountyRecord,
  type CountyOption,
} from '../mappers/countyMapper';
import {getLatestAudioTimestampForCountyId} from './audioService';
import {getUsersByCounty} from './userService';
import type {CountyConnectedUser, CountyListItem, CountyRecord} from '../types/county';
import type {ApiCounty} from '../types/user';
import {authorizedRequest, buildQuery, unwrapEntity, unwrapList} from '../utils';
import {pickLatestTimestamp} from '../../utils/countyActivity';

export type {CountyOption} from '../mappers/countyMapper';

const COUNTY_ENRICH_CONCURRENCY = 4;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    {length: Math.min(concurrency, items.length)},
    async () => {
      while (nextIndex < items.length) {
        const current = nextIndex;
        nextIndex += 1;
        results[current] = await mapper(items[current]);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

export async function listCounties(token: string): Promise<CountyOption[]> {
  const payload = await authorizedRequest<unknown>(token, endpoints.counties.root);
  return unwrapList<ApiCounty>(payload).map(mapCountyOption);
}

async function listCountyRecords(token: string): Promise<CountyRecord[]> {
  const payload = await authorizedRequest<unknown>(token, endpoints.counties.root);
  return unwrapList<ApiCounty>(payload).map(mapCountyRecord);
}

export async function getCountyById(
  token: string,
  countyId: string,
): Promise<CountyRecord> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.counties.byId(countyId),
  );
  return mapCountyRecord(unwrapEntity<ApiCounty>(payload));
}

export async function searchCounties(
  token: string,
  search?: string,
): Promise<CountyOption[]> {
  const query = buildQuery({search, q: search});
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.counties.search}${query}`,
  );
  return unwrapList<ApiCounty>(payload).map(mapCountyOption);
}

export async function getCountyConnectedUsers(
  token: string,
  countyId: string,
): Promise<CountyConnectedUser[]> {
  return getUsersByCounty(token, countyId);
}

const loadCountyConnections = async (
  token: string,
  county: CountyRecord,
): Promise<CountyListItem> => {
  const [usersResult, latestAudioResult] = await Promise.allSettled([
    getUsersByCounty(token, county.id),
    getLatestAudioTimestampForCountyId(token, county.id),
  ]);

  const userCount =
    usersResult.status === 'fulfilled' ? usersResult.value.length : 0;
  const lastActiveAt =
    latestAudioResult.status === 'fulfilled'
      ? latestAudioResult.value
      : null;

  return buildCountyListItem(county, userCount, lastActiveAt);
};

export async function listCountiesWithConnections(
  token: string,
): Promise<CountyListItem[]> {
  const counties = await listCountyRecords(token);
  const nowMs = Date.now();

  const enriched = await mapWithConcurrency(
    counties,
    COUNTY_ENRICH_CONCURRENCY,
    county => loadCountyConnections(token, county),
  );

  return enriched.map(item =>
    buildCountyListItem(item, item.userCount, item.lastActiveAt, nowMs),
  );
}

export async function getCountyListItem(
  token: string,
  countyId: string,
): Promise<CountyListItem> {
  const {county} = await getCountyDetail(token, countyId);
  return county;
}

export async function getCountyDetail(
  token: string,
  countyId: string,
): Promise<{
  county: CountyListItem;
  connectedUsers: CountyConnectedUser[];
}> {
  const [countyResult, usersResult, lastActiveResult] = await Promise.allSettled([
    getCountyById(token, countyId),
    getUsersByCounty(token, countyId),
    getLatestAudioTimestampForCountyId(token, countyId),
  ]);

  if (countyResult.status === 'rejected') {
    throw countyResult.reason;
  }

  const connectedUsers =
    usersResult.status === 'fulfilled' ? usersResult.value : [];
  const lastActiveAt =
    lastActiveResult.status === 'fulfilled' ? lastActiveResult.value : null;

  return {
    county: buildCountyListItem(
      countyResult.value,
      connectedUsers.length,
      lastActiveAt,
    ),
    connectedUsers,
  };
}

/** Refresh county metadata only (no users) — used when detail already has a list seed. */
export async function refreshCountyListItem(
  token: string,
  countyId: string,
  userCount: number,
): Promise<CountyListItem> {
  const [countyResult, lastActiveResult] = await Promise.allSettled([
    getCountyById(token, countyId),
    getLatestAudioTimestampForCountyId(token, countyId),
  ]);

  if (countyResult.status === 'rejected') {
    throw countyResult.reason;
  }

  const lastActiveAt =
    lastActiveResult.status === 'fulfilled' ? lastActiveResult.value : null;

  return buildCountyListItem(countyResult.value, userCount, lastActiveAt);
}

export const listCountyOptions = listCounties;

export const mergeCountyFeedActivity = (
  counties: CountyListItem[],
  feedTimestamps: Map<string, string>,
): CountyListItem[] => {
  const nowMs = Date.now();

  return counties.map(county => {
    const keys = [county.id, county.name].filter(Boolean) as string[];
    let feedLastActive: string | null = null;
    keys.forEach(key => {
      feedLastActive = pickLatestTimestamp(
        feedLastActive,
        feedTimestamps.get(key),
      );
    });

    const mergedLastActive = pickLatestTimestamp(county.lastActiveAt, feedLastActive);
    if (mergedLastActive === county.lastActiveAt) {
      return county;
    }

    return buildCountyListItem(county, county.userCount, mergedLastActive, nowMs);
  });
};
