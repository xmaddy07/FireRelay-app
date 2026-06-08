type SessionRevokedPayload = {
  sessionId?: string;
  userId?: string;
  all?: boolean;
};

const asRecord = (payload: unknown): SessionRevokedPayload | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  return payload as SessionRevokedPayload;
};

export const shouldLogoutOnSessionRevocation = (
  payload: unknown,
  currentSessionId?: string,
  currentUserId?: string,
): boolean => {
  const record = asRecord(payload);

  if (!record) {
    return true;
  }

  if (record.all) {
    return !currentUserId || !record.userId || record.userId === currentUserId;
  }

  if (record.sessionId) {
    return !currentSessionId || record.sessionId === currentSessionId;
  }

  if (record.userId) {
    return !currentUserId || record.userId === currentUserId;
  }

  return true;
};

export const isSessionRevokedSocketError = (payload: unknown): boolean => {
  if (!payload || typeof payload !== 'object' || !('message' in payload)) {
    return false;
  }

  const message = (payload as {message: unknown}).message;
  if (typeof message !== 'string') {
    return false;
  }

  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes('session revoked') ||
    normalized.includes('session has been revoked') ||
    normalized.includes('invalid session') ||
    normalized.includes('session expired')
  );
};
