import {API_BASE_URL} from '../config/env';
import {forceLogout} from '../services/auth/forceLogout';
import {endpoints} from './endpoints';
import type {ApiErrorBody} from './types/auth';

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(message: string, status: number, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
};

const collectConstraintMessages = (
  entry: unknown,
  out: string[],
): void => {
  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    if (trimmed) {
      out.push(trimmed);
    }
    return;
  }
  if (!entry || typeof entry !== 'object') {
    return;
  }

  const record = entry as Record<string, unknown>;

  if (typeof record.message === 'string' && record.message.trim()) {
    out.push(record.message.trim());
  }
  if (typeof record.msg === 'string' && record.msg.trim()) {
    out.push(record.msg.trim());
  }
  if (typeof record.error === 'string' && record.error.trim()) {
    out.push(record.error.trim());
  }

  if (Array.isArray(record.messages)) {
    record.messages.forEach(item => collectConstraintMessages(item, out));
  }
  if (Array.isArray(record.errors)) {
    record.errors.forEach(item => collectConstraintMessages(item, out));
  }

  if (record.constraints && typeof record.constraints === 'object') {
    Object.values(record.constraints as Record<string, unknown>).forEach(value => {
      if (typeof value === 'string' && value.trim()) {
        out.push(value.trim());
      }
    });
  }

  if (Array.isArray(record.children) && record.children.length > 0) {
    record.children.forEach(child => collectConstraintMessages(child, out));
  }

  // Nest / custom validators: { field: 'countyIds', detail: '...' }
  if (typeof record.detail === 'string' && record.detail.trim()) {
    out.push(record.detail.trim());
  }
  if (typeof record.description === 'string' && record.description.trim()) {
    out.push(record.description.trim());
  }

  // { field|property|path, ... } with no extractable message yet
  if (out.length === 0) {
    const field =
      (typeof record.property === 'string' && record.property) ||
      (typeof record.field === 'string' && record.field) ||
      (typeof record.path === 'string' && record.path) ||
      (Array.isArray(record.path) &&
        record.path.every(part => typeof part === 'string') &&
        (record.path as string[]).join('.')) ||
      null;
    if (field) {
      out.push(`${field} is invalid`);
    }
  }
};

const formatConstraintErrors = (errors: unknown): string | null => {
  if (!errors) {
    return null;
  }
  if (typeof errors === 'string') {
    return errors.trim() || null;
  }
  if (!Array.isArray(errors)) {
    if (typeof errors === 'object') {
      const parts: string[] = [];
      collectConstraintMessages(errors, parts);
      if (parts.length > 0) {
        return [...new Set(parts)].join('; ');
      }
      try {
        return JSON.stringify(errors);
      } catch {
        return null;
      }
    }
    return null;
  }

  const parts: string[] = [];
  errors.forEach(entry => collectConstraintMessages(entry, parts));
  if (parts.length > 0) {
    return [...new Set(parts)].join('; ');
  }

  // Last resort: surface raw payload so the user always sees something useful.
  try {
    const raw = JSON.stringify(errors);
    return raw && raw !== '[]' ? raw : null;
  } catch {
    return null;
  }
};

export const formatApiErrorMessage = (
  error: unknown,
  fallback = 'Please try again.',
): string => {
  if (error instanceof ApiError) {
    const fromBody = formatErrorMessage(error.body, error.message || fallback);
    return fromBody || fallback;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
};

const formatErrorMessage = (body?: ApiErrorBody, fallback = 'Request failed') => {
  const details = formatConstraintErrors(body?.errors);
  const baseMessage = body?.message
    ? Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message
    : null;

  if (details && baseMessage && baseMessage !== details) {
    // Avoid "Validation failed; Validation failed"
    if (baseMessage.toLowerCase() === 'validation failed') {
      return details;
    }
    return `${baseMessage}: ${details}`;
  }
  if (details) {
    return details;
  }
  if (baseMessage) {
    return baseMessage;
  }
  if (typeof body?.error === 'string' && body.error.trim()) {
    return body.error.trim();
  }
  return fallback;
};

const sanitizeBody = (body: unknown) => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const record = {...(body as Record<string, unknown>)};
  if ('password' in record) {
    record.password = '***';
  }
  return record;
};

const logApi = (label: string, payload: Record<string, unknown>) => {
  if (__DEV__) {
    console.log(`[API] ${label}`, payload);
  }
};

/** 401 on these paths means invalid credentials/code, not an expired session. */
const SKIP_FORCE_LOGOUT_ON_401 = new Set<string>([
  endpoints.auth.login,
  endpoints.auth.confirmEmailChange,
]);

const shouldForceLogoutOn401 = (path: string) =>
  !SKIP_FORCE_LOGOUT_ON_401.has(path);

const extractAuthToken = (response: Response, data: unknown): string | undefined => {
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    if (typeof body.accessToken === 'string') {
      return body.accessToken;
    }
    if (typeof body.access_token === 'string') {
      return body.access_token;
    }
    if (typeof body.token === 'string') {
      return body.token;
    }
  }

  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const cookieNames = [
      'access_token',
      'accessToken',
      'token',
      'jwt',
      'Authentication',
      'auth_token',
    ];
    for (const name of cookieNames) {
      const match = setCookie.match(new RegExp(`${name}=([^;,]+)`));
      if (match?.[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  return undefined;
};

export async function apiRequest<T>(
  path: string,
  {method = 'GET', body, token}: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  logApi('→ Request', {method, url, body: sanitizeBody(body)});

  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data: unknown;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | undefined;
    logApi('← Error', {method, url, status: response.status, body: errorBody});
    if (response.status === 401 && shouldForceLogoutOn401(path)) {
      forceLogout();
    }
    throw new ApiError(
      formatErrorMessage(errorBody, response.statusText || 'Request failed'),
      response.status,
      errorBody,
    );
  }

  logApi('← Response', {
    method,
    url,
    status: response.status,
    body: data,
    hasToken: Boolean(extractAuthToken(response, data)),
  });

  return data as T;
}

export async function apiRequestWithAuth<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{data: T; token?: string}> {
  const url = `${API_BASE_URL}${path}`;
  const {method = 'GET', body, token: bearerToken} = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  logApi('→ Request', {method, url, body: sanitizeBody(body)});

  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data: unknown;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  const authToken = extractAuthToken(response, data);

  if (!response.ok) {
    const errorBody = data as ApiErrorBody | undefined;
    logApi('← Error', {method, url, status: response.status, body: errorBody});
    if (response.status === 401 && shouldForceLogoutOn401(path)) {
      forceLogout();
    }
    throw new ApiError(
      formatErrorMessage(errorBody, response.statusText || 'Request failed'),
      response.status,
      errorBody,
    );
  }

  logApi('← Response', {
    method,
    url,
    status: response.status,
    body: data,
    hasToken: Boolean(authToken),
  });

  return {data: data as T, token: authToken};
}
