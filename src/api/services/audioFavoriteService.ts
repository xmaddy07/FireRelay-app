import {endpoints} from '../endpoints';
import type {ApiAudio} from '../types/audio';
import {authorizedRequest, unwrapList} from '../utils';

const extractAudioId = (entry: unknown): string | undefined => {
  if (typeof entry === 'string') {
    return entry;
  }
  if (!entry || typeof entry !== 'object') {
    return undefined;
  }

  const record = entry as Record<string, unknown>;
  if (typeof record.audioId === 'string') {
    return record.audioId;
  }
  if (typeof record.audio_id === 'string') {
    return record.audio_id;
  }
  if (typeof record.id === 'string') {
    return record.id;
  }

  const audio = record.audio;
  if (audio && typeof audio === 'object' && typeof (audio as ApiAudio).id === 'string') {
    return (audio as ApiAudio).id;
  }

  return undefined;
};

type FavoritesCache = {
  token: string;
  ids: Set<string>;
  fetchedAt: number;
  inflight: Promise<Set<string>> | null;
};

const FAVORITES_TTL_MS = 60_000;
let favoritesCache: FavoritesCache | null = null;

const invalidateFavoriteIdsCache = () => {
  favoritesCache = null;
};

export async function getFavoriteAudioIds(token: string): Promise<Set<string>> {
  const now = Date.now();
  if (
    favoritesCache &&
    favoritesCache.token === token &&
    now - favoritesCache.fetchedAt < FAVORITES_TTL_MS
  ) {
    return favoritesCache.ids;
  }

  if (favoritesCache?.token === token && favoritesCache.inflight) {
    return favoritesCache.inflight;
  }

  const inflight = (async () => {
    const payload = await authorizedRequest<unknown>(
      token,
      endpoints.audioFavorites.me,
    );
    const items = unwrapList<unknown>(payload);
    const ids = new Set(
      items
        .map(extractAudioId)
        .filter((id): id is string => Boolean(id)),
    );
    favoritesCache = {
      token,
      ids,
      fetchedAt: Date.now(),
      inflight: null,
    };
    return ids;
  })();

  favoritesCache = {
    token,
    ids: favoritesCache?.token === token ? favoritesCache.ids : new Set(),
    fetchedAt: favoritesCache?.token === token ? favoritesCache.fetchedAt : 0,
    inflight,
  };

  try {
    return await inflight;
  } catch (error) {
    if (favoritesCache?.inflight === inflight) {
      favoritesCache.inflight = null;
    }
    throw error;
  }
}

export async function addAudioFavorite(
  token: string,
  audioId: string,
): Promise<void> {
  await authorizedRequest(token, endpoints.audioFavorites.favorite(audioId), {
    method: 'POST',
  });
  if (favoritesCache?.token === token) {
    favoritesCache.ids.add(audioId);
    favoritesCache.fetchedAt = Date.now();
  } else {
    invalidateFavoriteIdsCache();
  }
}

export async function removeAudioFavorite(
  token: string,
  audioId: string,
): Promise<void> {
  await authorizedRequest(token, endpoints.audioFavorites.favorite(audioId), {
    method: 'DELETE',
  });
  if (favoritesCache?.token === token) {
    favoritesCache.ids.delete(audioId);
    favoritesCache.fetchedAt = Date.now();
  } else {
    invalidateFavoriteIdsCache();
  }
}
