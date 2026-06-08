const decodeBase64Url = (segment: string): string | null => {
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded =
      normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const atobFn = (globalThis as {atob?: (value: string) => string}).atob;
    if (typeof atobFn !== 'function') {
      return null;
    }
    return atobFn(padded);
  } catch {
    return null;
  }
};

export const parseJwtPayload = (
  token: string,
): Record<string, unknown> | null => {
  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }

  const decoded = decodeBase64Url(segments[1]);
  if (!decoded) {
    return null;
  }

  try {
    const payload = JSON.parse(decoded);
    return payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

export const getSessionIdFromToken = (token: string): string | undefined => {
  const payload = parseJwtPayload(token);
  if (!payload) {
    return undefined;
  }

  const candidates = ['sessionId', 'session_id', 'sid', 'jti'];
  for (const key of candidates) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};
