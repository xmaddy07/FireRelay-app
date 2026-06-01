import {endpoints} from '../endpoints';
import {
  mapKeywordToRecord,
  mapRecordToCreatePayload,
  mapRecordToUpdatePayload,
} from '../mappers/keywordMapper';
import type {KeywordRecord} from '../../screens/main/keyword/types';
import type {
  ApiKeyword,
  CreateKeywordPayload,
  KeywordSearchParams,
  UpdateKeywordPayload,
} from '../types/keyword';
import {authorizedRequest, buildQuery, unwrapList, unwrapPaginated} from '../utils';

export type KeywordSearchResult = {
  items: KeywordRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  totalFromApi: boolean;
};

export async function searchKeywords(
  token: string,
  params: KeywordSearchParams = {},
): Promise<KeywordSearchResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const searchTerm = params.search ?? params.q ?? params.keyword;
  const query = buildQuery({
    page,
    limit,
    search: searchTerm,
  });
  const payload = await authorizedRequest<unknown>(
    token,
    `${endpoints.keywords.search}${query}`,
  );

  const paginated = unwrapPaginated<ApiKeyword>(payload, page, limit);
  return {
    ...paginated,
    items: paginated.items.map(mapKeywordToRecord),
  };
}

/** Fetches all keywords (unpaginated) to resolve total count when search omits it. */
export async function listKeywords(token: string): Promise<KeywordRecord[]> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.keywords.list,
  );
  return unwrapList<ApiKeyword>(payload).map(mapKeywordToRecord);
}

export async function createKeyword(
  token: string,
  keyword: KeywordRecord,
): Promise<KeywordRecord> {
  const body: CreateKeywordPayload = mapRecordToCreatePayload(keyword);
  const created = await authorizedRequest<ApiKeyword>(token, endpoints.keywords.root, {
    method: 'POST',
    body,
  });
  return mapKeywordToRecord(created);
}

export async function updateKeyword(
  token: string,
  keyword: KeywordRecord,
): Promise<KeywordRecord> {
  const body: UpdateKeywordPayload = mapRecordToUpdatePayload(keyword);
  const updated = await authorizedRequest<ApiKeyword>(
    token,
    endpoints.keywords.byId(keyword.id),
    {
      method: 'PATCH',
      body,
    },
  );
  return mapKeywordToRecord(updated);
}

export async function deleteKeyword(token: string, id: string): Promise<void> {
  await authorizedRequest(token, endpoints.keywords.byId(id), {
    method: 'DELETE',
  });
}
