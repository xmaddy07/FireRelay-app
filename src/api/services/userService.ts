import {endpoints} from '../endpoints';
import {mapCountyOption} from '../mappers/countyMapper';
import {derivePresenceStatus, mapUserToRecord} from '../mappers/userMapper';
import type {CountyConnectedUser} from '../types/county';
import type {UserRecord} from '../../screens/main/leadLog/types';
import type {
  ApiCounty,
  ApiUser,
  ApiUserSession,
  ApiUserTalkgroupAccess,
  AssignCountiesPayload,
  AssignTalkgroupAccessRequest,
  CreateUserPayload,
  UpdateUserPayload,
  UserSearchParams,
} from '../types/user';
import {
  authorizedRequest,
  buildQuery,
  pickString,
  unwrapEntity,
  unwrapList,
} from '../utils';

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

export async function getUserById(token: string, id: string): Promise<UserRecord> {
  const payload = await authorizedRequest<unknown>(token, endpoints.users.byId(id));
  return mapUserToRecord(unwrapEntity<ApiUser>(payload));
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

export async function getUsersByCounty(
  token: string,
  countyId: string,
): Promise<CountyConnectedUser[]> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.users.byCounty(countyId),
  );

  return unwrapList<ApiUser>(payload).map(user => {
    const record = user as Record<string, unknown>;
    return {
      id: user.id,
      email: pickString(record, ['email']) ?? 'unknown',
    };
  });
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

export type UserSessionRecord = {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserTalkgroupAccessRecord = {
  id: string;
  userId: string;
  countyId: string;
  talkgroupID: string;
  talkgroup: string;
};

const toSessionRecord = (session: ApiUserSession): UserSessionRecord => ({
  id: String(session.id ?? ''),
  userId: String(session.userId ?? ''),
  deviceInfo: String(session.deviceInfo ?? ''),
  ipAddress: String(session.ipAddress ?? ''),
  userAgent: String(session.userAgent ?? ''),
  lastSeenAt: String(session.lastSeenAt ?? ''),
  expiresAt: String(session.expiresAt ?? ''),
  revokedAt:
    typeof session.revokedAt === 'string' && session.revokedAt.trim()
      ? session.revokedAt
      : null,
  createdAt: String(session.createdAt ?? ''),
  updatedAt: String(session.updatedAt ?? ''),
});

const toTalkgroupAccessRecord = (
  record: ApiUserTalkgroupAccess,
): UserTalkgroupAccessRecord => ({
  id: String(record.id ?? ''),
  userId: String(record.userId ?? ''),
  countyId: String(record.countyId ?? ''),
  talkgroupID: String(record.talkgroupID ?? ''),
  talkgroup: String(record.talkgroup ?? record.talkgroupID ?? ''),
});

export const summarizeUserSessions = (
  sessions: UserSessionRecord[],
): Pick<UserRecord, 'lastSeenAt' | 'activeSessionCount' | 'presenceStatus'> => {
  const activeSessions = sessions.filter(session => !session.revokedAt);
  const lastSeenAt =
    activeSessions
      .map(session => session.lastSeenAt)
      .filter(ts => ts && !Number.isNaN(new Date(ts).getTime()))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

  const activeSessionCount = activeSessions.length;

  return {
    lastSeenAt,
    activeSessionCount,
    presenceStatus: derivePresenceStatus(
      activeSessionCount > 0 ? lastSeenAt : null,
    ),
  };
};

export async function enrichUsersWithSessionSummaries(
  token: string,
  users: UserRecord[],
): Promise<UserRecord[]> {
  const results = await Promise.allSettled(
    users.map(async user => {
      const sessions = await listUserSessions(token, user.id);
      return {...user, ...summarizeUserSessions(sessions)};
    }),
  );

  return results.map((result, index) =>
    result.status === 'fulfilled' ? result.value : users[index],
  );
}

export async function listUserSessions(
  token: string,
  userId: string,
): Promise<UserSessionRecord[]> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.users.sessions(userId),
  );
  return unwrapList<ApiUserSession>(payload).map(toSessionRecord);
}

export async function revokeUserSession(
  token: string,
  userId: string,
  sessionId: string,
): Promise<UserSessionRecord> {
  const payload = await authorizedRequest<ApiUserSession>(
    token,
    endpoints.users.sessionById(userId, sessionId),
    {method: 'DELETE'},
  );
  return toSessionRecord(payload);
}

export async function forcePasswordReset(
  token: string,
  userId: string,
): Promise<UserRecord> {
  const payload = await authorizedRequest<ApiUser>(
    token,
    endpoints.users.forcePasswordReset(userId),
    {method: 'POST'},
  );
  return mapUserToRecord(payload);
}

export async function getUserTalkgroupAccess(
  token: string,
  userId: string,
): Promise<UserTalkgroupAccessRecord[]> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.users.talkgroupAccess(userId),
  );
  return unwrapList<ApiUserTalkgroupAccess>(payload).map(toTalkgroupAccessRecord);
}

export async function assignUserTalkgroupAccess(
  token: string,
  userId: string,
  request: AssignTalkgroupAccessRequest,
): Promise<UserTalkgroupAccessRecord[]> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.users.talkgroupAccess(userId),
    {
      method: 'POST',
      body: request,
    },
  );
  return unwrapList<ApiUserTalkgroupAccess>(payload).map(toTalkgroupAccessRecord);
}

