import type {SenderRecord, SenderStatus} from '../../screens/main/senders/types';
import type {ApiSender} from '../types/sender';
import {pickString} from '../utils';

const mapStatus = (status?: string): SenderStatus => {
  const normalized = (status ?? 'active').toLowerCase();
  if (normalized === 'inactive' || normalized === 'disabled') {
    return normalized;
  }
  return 'active';
};

export const mapSenderToRecord = (sender: ApiSender): SenderRecord => {
  const record = sender as Record<string, unknown>;
  const email = pickString(record, ['email']);
  const domain =
    pickString(record, ['domain']) ??
    (email?.includes('@') ? email.split('@')[1] : undefined);

  return {
    id: sender.id,
    name: pickString(record, ['name']) ?? 'Unnamed sender',
    email,
    domain,
    status: mapStatus(pickString(record, ['status'])),
    token:
      pickString(record, ['token', 'apiToken']) ?? '',
    description: pickString(record, ['description']),
    createdAt:
      pickString(record, ['createdAt', 'created_at']) ??
      new Date().toISOString(),
  };
};

export const mapRecordToCreatePayload = (sender: SenderRecord) => ({
  name: sender.name,
  email: sender.email,
  description: sender.description,
  status: sender.status,
});

export const mapRecordToUpdatePayload = (sender: SenderRecord) =>
  mapRecordToCreatePayload(sender);
