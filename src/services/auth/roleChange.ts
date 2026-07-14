import type {AuthUser} from '../../api/types/auth';
import {userActions, type UserState} from '../../redux/slices/userSlice';
import {store} from '../../redux/store';
import {forceLogoutDueToRoleChange} from './forceLogout';

export type AppRole = NonNullable<UserState['role']>;

export const normalizeRole = (role?: string | null): AppRole =>
  role?.toLowerCase() === 'admin' ? 'admin' : 'user';

export const mapProfileToUserState = (profile: AuthUser): UserState => ({
  id: typeof profile.id === 'string' ? profile.id : undefined,
  name:
    typeof profile.name === 'string'
      ? profile.name
      : typeof profile.email === 'string'
        ? profile.email.split('@')[0]
        : undefined,
  email: typeof profile.email === 'string' ? profile.email : undefined,
  role: normalizeRole(profile.role),
});

/**
 * Syncs profile into Redux. If the stored session role differs from the
 * profile role, force-logout and return null.
 */
export const syncProfileOrLogoutOnRoleChange = (
  profile: AuthUser,
): UserState | null => {
  const {auth, user} = store.getState();
  if (!auth.isAuthenticated) {
    return null;
  }

  const remoteRole = normalizeRole(profile.role);
  if (user.role != null && user.role !== remoteRole) {
    forceLogoutDueToRoleChange();
    return null;
  }

  const mapped = mapProfileToUserState(profile);
  store.dispatch(userActions.setUser(mapped));
  return mapped;
};

type RoleChangeSocketPayload = {
  userId?: string;
  id?: string;
  role?: string;
  newRole?: string;
};

const asRolePayload = (payload: unknown): RoleChangeSocketPayload | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  return payload as RoleChangeSocketPayload;
};

/** True when the event clearly targets a different user. */
export const isRoleEventForOtherUser = (
  payload: unknown,
  currentUserId?: string,
): boolean => {
  if (!currentUserId) {
    return false;
  }
  const record = asRolePayload(payload);
  const targetUserId = record?.userId ?? record?.id;
  return Boolean(targetUserId && targetUserId !== currentUserId);
};

/**
 * If the socket payload includes a new role for the current user that differs
 * from the session role, force-logout immediately and return true.
 */
export const handleRoleChangeSocketPayload = (payload: unknown): boolean => {
  const {auth, user} = store.getState();
  if (!auth.isAuthenticated || !user.id) {
    return false;
  }

  const record = asRolePayload(payload);
  if (!record) {
    return false;
  }

  const targetUserId = record.userId ?? record.id;
  if (targetUserId && targetUserId !== user.id) {
    return false;
  }

  const remoteRoleRaw = record.role ?? record.newRole;
  if (remoteRoleRaw == null) {
    return false;
  }

  const remoteRole = normalizeRole(remoteRoleRaw);
  if (user.role != null && user.role !== remoteRole) {
    forceLogoutDueToRoleChange();
    return true;
  }

  return false;
};
