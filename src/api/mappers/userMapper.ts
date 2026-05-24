import type {UserRecord, UserRole} from '../../screens/main/leadLog/types';
import type {ApiCounty, ApiUser} from '../types/user';
import {pickString} from '../utils';

const mapRole = (role?: string): UserRole =>
  role?.toLowerCase() === 'admin' ? 'admin' : 'user';

const countyNamesFromPayload = (counties: unknown): string[] => {
  if (!Array.isArray(counties)) {
    return [];
  }

  return counties
    .map(item => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object') {
        const record = item as ApiCounty;
        return pickString(record as Record<string, unknown>, ['name', 'code']);
      }
      return undefined;
    })
    .filter((name): name is string => Boolean(name));
};

export const mapUserToRecord = (user: ApiUser): UserRecord => ({
  id: user.id,
  email: pickString(user as Record<string, unknown>, ['email']) ?? 'unknown',
  role: mapRole(pickString(user as Record<string, unknown>, ['role'])),
  createdAt:
    pickString(user as Record<string, unknown>, ['createdAt', 'created_at']) ??
    new Date().toISOString(),
  counties: countyNamesFromPayload(user.counties),
});

export const mapCountyOption = (county: ApiCounty) => ({
  id: county.id,
  name: pickString(county as Record<string, unknown>, ['name']) ?? county.id,
  code: pickString(county as Record<string, unknown>, ['code']) ?? '',
  state: pickString(county as Record<string, unknown>, ['state']) ?? 'Texas',
  established:
    pickString(county as Record<string, unknown>, ['established', 'est']) ??
    '',
});
