const normalizeCountyList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

/** Resolves county access from the API payload (with optional email fallback later). */
export const resolveUserCounties = (
  counties: unknown,
  _email?: string,
): string[] => normalizeCountyList(counties);
