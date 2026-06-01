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
import {
  authorizedRequest,
  buildQuery,
  unwrapEntity,
  unwrapList,
} from '../utils';

export async function listSenders(
  token: string | undefined,
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
    `${endpoints.senders.root}${query}`,
  );

  return unwrapList<ApiSender>(payload).map(mapSenderToRecord);
}

export async function searchSenders(
  token: string | undefined,
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

export async function getSenderById(
  token: string | undefined,
  id: string,
): Promise<SenderRecord> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.senders.byId(id),
  );
  return mapSenderToRecord(unwrapEntity<ApiSender>(payload));
}

export async function createSender(
  token: string | undefined,
  sender: SenderRecord,
): Promise<SenderRecord> {
  const body: CreateSenderPayload = mapRecordToCreatePayload(sender);
  const payload = await authorizedRequest<unknown>(token, endpoints.senders.root, {
    method: 'POST',
    body,
  });
  return mapSenderToRecord(unwrapEntity<ApiSender>(payload));
}

export async function updateSender(
  token: string | undefined,
  sender: SenderRecord,
): Promise<SenderRecord> {
  const body: UpdateSenderPayload = mapRecordToUpdatePayload(sender);
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.senders.byId(sender.id),
    {
      method: 'PATCH',
      body,
    },
  );
  return mapSenderToRecord(unwrapEntity<ApiSender>(payload));
}

export async function deleteSender(
  token: string | undefined,
  id: string,
): Promise<void> {
  await authorizedRequest(token, endpoints.senders.byId(id), {
    method: 'DELETE',
  });
}

export async function regenerateSenderToken(
  token: string | undefined,
  id: string,
): Promise<SenderRecord> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.senders.regenerateToken(id),
    {method: 'POST'},
  );
  return mapSenderToRecord(unwrapEntity<ApiSender>(payload));
}
