import {endpoints} from '../endpoints';
import {mapCountyOption, mapUserToRecord} from '../mappers/userMapper';
import type {UserRecord} from '../../screens/main/leadLog/types';
import type {
  ApiCounty,
  ApiUser,
  AssignCountiesPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UserSearchParams,
} from '../types/user';
import {authorizedRequest, buildQuery, unwrapList} from '../utils';

export async function searchUsers(
  token: string,
  params: UserSearchParams = {},
): Promise<UserRecord[]> {
  const query = buildQuery({
    page: params.page,
    limit: params.limit,
    search: params.search ?? params.q ?? params.email,
    q: params.q ?? params.search,
    email: params.email,
    role: params.role?.toLowerCase(),
  });
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.users.search}${query}`,
  );

  return unwrapList<ApiUser>(payload).map(mapUserToRecord);
}

export async function createUser(
  token: string,
  payload: CreateUserPayload,
): Promise<UserRecord> {
  const created = await authorizedRequest<ApiUser>(token, endpoints.users.list, {
    method: 'POST',
    body: payload,
  });
  return mapUserToRecord(created);
}

export async function updateUser(
  token: string,
  id: string,
  payload: UpdateUserPayload,
): Promise<UserRecord> {
  const updated = await authorizedRequest<ApiUser>(
    token,
    endpoints.users.byId(id),
    {
      method: 'PATCH',
      body: payload,
    },
  );
  return mapUserToRecord(updated);
}

export async function deleteUser(token: string, id: string): Promise<void> {
  await authorizedRequest(token, endpoints.users.byId(id), {
    method: 'DELETE',
  });
}

export async function getUserCounties(token: string, userId: string) {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.users.counties(userId),
  );
  return unwrapList<ApiCounty>(payload).map(mapCountyOption);
}

export async function assignUserCounties(
  token: string,
  userId: string,
  countyIds: string[],
): Promise<void> {
  const body: AssignCountiesPayload = {countyIds};
  await authorizedRequest(token, endpoints.users.counties(userId), {
    method: 'POST',
    body,
  });
}
