import {endpoints} from '../endpoints';
import type {ApiAudio} from '../types/audio';
import {authorizedRequest, unwrapList} from '../utils';

const extractAudioId = (entry: unknown): string | undefined => {
  if (!entry || typeof entry !== 'object') {
    return undefined;
  }

  const record = entry as Record<string, unknown>;
  if (typeof record.audioId === 'string') {
    return record.audioId;
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

export async function getFavoriteAudioIds(token: string): Promise<Set<string>> {
  const payload = await authorizedRequest<unknown>(
    token,
    endpoints.audioFavorites.me,
  );
  const items = unwrapList<unknown>(payload);
  const ids = items
    .map(extractAudioId)
    .filter((id): id is string => Boolean(id));

  return new Set(ids);
}

export async function addAudioFavorite(
  token: string,
  audioId: string,
): Promise<void> {
  await authorizedRequest(token, endpoints.audioFavorites.favorite(audioId), {
    method: 'POST',
  });
}

export async function removeAudioFavorite(
  token: string,
  audioId: string,
): Promise<void> {
  await authorizedRequest(token, endpoints.audioFavorites.favorite(audioId), {
    method: 'DELETE',
  });
}
