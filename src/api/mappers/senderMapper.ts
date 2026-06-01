import type {SenderRecord, SenderStatus} from '../../screens/main/senders/types';
import type {ApiSender, CreateSenderPayload} from '../types/sender';
import {pickBoolean, pickString} from '../utils';

const mapStatus = (status?: string): SenderStatus => {
  const normalized = (status ?? 'active').toLowerCase();
  if (normalized === 'inactive' || normalized === 'disabled') {
    return normalized;
  }
  return 'active';
};

const mapStatusFromApi = (record: Record<string, unknown>): SenderStatus => {
  const status = pickString(record, ['status']);
  if (status) {
    return mapStatus(status);
  }
  const isActive = pickBoolean(record, ['isActive', 'is_active']);
  if (isActive === false) {
    return 'inactive';
  }
  return 'active';
};

const statusToIsActive = (status: SenderStatus): boolean => status === 'active';

export const mapSenderToRecord = (sender: ApiSender): SenderRecord => {
  const record = sender as Record<string, unknown>;
  const email = pickString(record, ['email']);
  const domain =
    pickString(record, ['domain']) ??
    (email?.includes('@') ? email.split('@')[1] : undefined);

  return {
    id: pickString(record, ['id', '_id']) ?? '',
    name: pickString(record, ['name']) ?? 'Unnamed sender',
    email,
    domain,
    status: mapStatusFromApi(record),
    token:
      pickString(record, ['token', 'apiToken']) ?? '',
    description: pickString(record, ['description']),
    createdAt:
      pickString(record, ['createdAt', 'created_at']) ??
      new Date().toISOString(),
  };
};

export const mapRecordToCreatePayload = (
  sender: SenderRecord,
): CreateSenderPayload => ({
  name: sender.name,
  description: sender.description,
  isActive: statusToIsActive(sender.status),
});

export const mapRecordToUpdatePayload = (sender: SenderRecord) =>
  mapRecordToCreatePayload(sender);
