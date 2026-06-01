import {API_BASE_URL} from '../config/env';
import type {ApiErrorBody} from './types/auth';
import {store} from '../redux/store';
import {authActions} from '../redux/slices/authSlice';
import {userActions} from '../redux/slices/userSlice';

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

const formatErrorMessage = (body?: ApiErrorBody, fallback = 'Request failed') => {
  if (!body?.message) {
    return fallback;
  }
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
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
    'ngrok-skip-browser-warning': 'true',
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
    if (response.status === 401 && path !== '/auth/login') {
      store.dispatch(authActions.logout());
      store.dispatch(userActions.clearUser());
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
    'ngrok-skip-browser-warning': 'true',
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
    if (response.status === 401 && path !== '/auth/login') {
      store.dispatch(authActions.logout());
      store.dispatch(userActions.clearUser());
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
