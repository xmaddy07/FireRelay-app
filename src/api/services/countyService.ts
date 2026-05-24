import {endpoints} from '../endpoints';
import {mapCountyOption} from '../mappers/userMapper';
import type {ApiCounty} from '../types/user';
import {authorizedRequest, buildQuery, unwrapList} from '../utils';

export type CountyOption = ReturnType<typeof mapCountyOption>;

export async function listCounties(token: string): Promise<CountyOption[]> {
  const payload = await authorizedRequest<unknown>(token, endpoints.counties.root);
  return unwrapList<ApiCounty>(payload).map(mapCountyOption);
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
