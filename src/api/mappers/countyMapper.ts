import type {
  CountyActivityView,
  CountyListItem,
  CountyRecord,
} from '../types/county';
import type {ApiCounty} from '../types/user';
import {
  deriveCountyActivity,
  formatCountyLocationLabel,
  resolveCountyCode,
} from '../../utils/countyActivity';
import {pickString} from '../utils';

export type CountyOption = {
  id: string;
  name: string;
  code: string;
  state: string;
  established: string;
};

export const mapCountyRecord = (county: ApiCounty): CountyRecord => {
  const record = county as Record<string, unknown>;
  const name = pickString(record, ['name']) ?? county.id;
  const rawCode = pickString(record, ['code']) ?? '';

  return {
    id: county.id,
    name,
    code: resolveCountyCode(name, rawCode),
    state: pickString(record, ['state']) ?? '',
    createdAt:
      pickString(record, ['createdAt', 'created_at']) ?? '',
    updatedAt:
      pickString(record, ['updatedAt', 'updated_at']) ?? '',
  };
};

export const mapCountyOption = (county: ApiCounty): CountyOption => {
  const record = county as Record<string, unknown>;
  const name = pickString(record, ['name']) ?? county.id;
  const rawCode = pickString(record, ['code']) ?? '';

  return {
    id: county.id,
    name,
    code: resolveCountyCode(name, rawCode),
    state: pickString(record, ['state']) ?? 'Texas',
    established: pickString(record, ['established', 'est']) ?? '',
  };
};

export const buildCountyListItem = (
  county: CountyRecord,
  userCount: number,
  lastActiveAt: string | null,
  nowMs = Date.now(),
): CountyListItem => {
  const activity: CountyActivityView = deriveCountyActivity(lastActiveAt, nowMs);

  return {
    ...county,
    locationLabel: formatCountyLocationLabel(
      county.code,
      county.state,
      county.name,
    ),
    userCount,
    lastActiveAt,
    activity,
  };
};
