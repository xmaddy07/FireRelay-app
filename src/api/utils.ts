import {ApiError, apiRequestWithAuth} from './client';
import type {PaginatedResponse, QueryValue} from './types/common';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
};

export const buildQuery = (params: Record<string, QueryValue>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    search.append(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

export const requireToken = (token: string | undefined): string => {
  if (!token) {
    throw new ApiError('Not authenticated', 401);
  }
  return token;
};

export async function authorizedRequest<T>(
  token: string | undefined,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {data} = await apiRequestWithAuth<T>(path, {
    ...options,
    token,
  });
  return data;
}

const toRecord = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  return payload as Record<string, unknown>;
};

export const unwrapList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  const record = toRecord(payload);
  if (!record) {
    return [];
  }

  const list =
    record.data ??
    record.items ??
    record.results ??
    record.keywords ??
    record.senders ??
    record.users;
  if (Array.isArray(list)) {
    return list as T[];
  }
  if (list && typeof list === 'object') {
    return unwrapList<T>(list);
  }

  return [];
};

export const unwrapEntity = <T>(payload: unknown): T => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload as T;
  }

  const record = payload as Record<string, unknown>;
  const nested =
    record.data ?? record.sender ?? record.item ?? record.result;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as T;
  }

  return payload as T;
};

export type UnwrappedPagination<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  totalFromApi: boolean;
};

export const pickNumber = (
  source: Record<string, unknown>,
  keys: string[],
): number | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
};

const pickPaginationMeta = (
  payload: unknown,
): Record<string, unknown> => {
  const record = toRecord(payload);
  if (!record) {
    return {};
  }

  const sources: Record<string, unknown>[] = [record];
  const nestedMeta = toRecord(record.meta);
  const nestedPagination = toRecord(record.pagination);
  const nestedData = toRecord(record.data);

  if (nestedMeta) {
    sources.push(nestedMeta);
  }
  if (nestedPagination) {
    sources.push(nestedPagination);
  }
  if (nestedData) {
    sources.push(nestedData);
    const dataMeta = toRecord(nestedData.meta);
    const dataPagination = toRecord(nestedData.pagination);
    if (dataMeta) {
      sources.push(dataMeta);
    }
    if (dataPagination) {
      sources.push(dataPagination);
    }
  }

  return Object.assign({}, ...sources);
};

export const unwrapPaginated = <T>(
  payload: unknown,
  fallbackPage: number,
  fallbackLimit: number,
): UnwrappedPagination<T> => {
  const items = unwrapList<T>(payload);
  const meta = pickPaginationMeta(payload);

  const limit =
    pickNumber(meta, ['limit', 'perPage', 'per_page', 'pageSize', 'page_size']) ??
    fallbackLimit;
  const explicitTotal = pickNumber(meta, [
    'total',
    'totalCount',
    'total_count',
    'count',
    'totalItems',
    'total_items',
    'totalRecords',
    'total_records',
  ]);
  const page =
    pickNumber(meta, ['page', 'currentPage', 'current_page']) ?? fallbackPage;
  const explicitTotalPages = pickNumber(meta, [
    'totalPages',
    'total_pages',
    'pageCount',
    'page_count',
  ]);

  const totalFromApi = explicitTotal !== undefined;
  const total = explicitTotal ?? items.length;
  const receivedFullPage = items.length >= fallbackLimit;
  const totalPages =
    explicitTotalPages ??
    (totalFromApi
      ? Math.max(1, Math.ceil(total / Math.max(limit, 1)))
      : receivedFullPage
        ? Math.max(page + 1, 2)
        : page);
  const hasMoreFlag =
    meta.hasMore === true ||
    meta.has_more === true ||
    meta.hasNextPage === true ||
    meta.has_next_page === true;
  const hasMore =
    hasMoreFlag ||
    page < totalPages ||
    (!totalFromApi && receivedFullPage);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasMore,
    totalFromApi,
  };
};

export const pickString = (
  source: Record<string, unknown>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return undefined;
};

export const pickBoolean = (
  source: Record<string, unknown>,
  keys: string[],
): boolean | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
};
