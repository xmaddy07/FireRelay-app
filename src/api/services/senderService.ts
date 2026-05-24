import {endpoints} from '../endpoints';
import {
  mapRecordToCreatePayload,
  mapRecordToUpdatePayload,
  mapSenderToRecord,
} from '../mappers/senderMapper';
import type {SenderRecord} from '../../screens/main/senders/types';
import type {
  ApiSender,
  CreateSenderPayload,
  SenderSearchParams,
  UpdateSenderPayload,
} from '../types/sender';
import {authorizedRequest, buildQuery, unwrapList} from '../utils';

export async function searchSenders(
  token: string,
  params: SenderSearchParams = {},
): Promise<SenderRecord[]> {
  const query = buildQuery({
    page: params.page,
    limit: params.limit,
    search: params.search ?? params.q,
    q: params.q ?? params.search,
    status: params.status,
  });
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.senders.search}${query}`,
  );

  return unwrapList<ApiSender>(payload).map(mapSenderToRecord);
}

export async function createSender(
  token: string,
  sender: SenderRecord,
): Promise<SenderRecord> {
  const body: CreateSenderPayload = mapRecordToCreatePayload(sender);
  const created = await authorizedRequest<ApiSender>(token, endpoints.senders.root, {
    method: 'POST',
    body,
  });
  return mapSenderToRecord(created);
}

export async function updateSender(
  token: string,
  sender: SenderRecord,
): Promise<SenderRecord> {
  const body: UpdateSenderPayload = mapRecordToUpdatePayload(sender);
  const updated = await authorizedRequest<ApiSender>(
    token,
    endpoints.senders.byId(sender.id),
    {
      method: 'PATCH',
      body,
    },
  );
  return mapSenderToRecord(updated);
}

export async function deleteSender(token: string, id: string): Promise<void> {
  await authorizedRequest(token, endpoints.senders.byId(id), {
    method: 'DELETE',
  });
}

export async function regenerateSenderToken(
  token: string,
  id: string,
): Promise<SenderRecord> {
  const updated = await authorizedRequest<ApiSender>(
    token,
    endpoints.senders.regenerateToken(id),
    {method: 'POST'},
  );
  return mapSenderToRecord(updated);
}
