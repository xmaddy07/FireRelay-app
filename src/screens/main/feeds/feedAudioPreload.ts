import Sound from 'react-native-sound';
import {getAudioFileUrl} from '../../../api';
import {getFeedAudioUri} from '../../../assets/audio';
import {store} from '../../../redux/store';
import {
  clearAudioCache,
  clearAudioCacheEntry,
  setAudioError,
  setAudioLoading,
  setAudioReady,
} from '../../../redux/slices/audioCacheSlice';

export type CachedAudio = {
  sound: Sound;
  duration: number;
};

type CacheEntry = CachedAudio & {
  lastAccess: number;
};

const cache = new Map<string, CacheEntry>();
const inflight = new Set<string>();
const cancelled = new Set<string>();

const PRELOAD_POLL_MS = 50;
const MAX_CACHE_SIZE = 20;

const resolveUri = (
  itemId: string,
  audioFilename?: string,
  audioUrl?: string,
) =>
  audioUrl ??
  (audioFilename ? getAudioFileUrl(audioFilename) : getFeedAudioUri(itemId));

const readSoundDuration = (sound: Sound) => {
  const duration = sound.getDuration();
  return duration > 0 ? duration : 0;
};

const touchEntry = (entry: CacheEntry) => {
  entry.lastAccess = Date.now();
};

const evictIfNeeded = (protectedId?: string) => {
  while (cache.size > MAX_CACHE_SIZE) {
    let oldestId: string | null = null;
    let oldestAccess = Infinity;

    cache.forEach((entry, id) => {
      if (id === protectedId) {
        return;
      }
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestId = id;
      }
    });

    if (!oldestId) {
      break;
    }

    const evicted = cache.get(oldestId);
    if (evicted) {
      evicted.sound.stop();
      evicted.sound.release();
    }
    cache.delete(oldestId);
    store.dispatch(clearAudioCacheEntry(oldestId));
  }
};

export const isFeedAudioPreloadInflight = (itemId: string) => inflight.has(itemId);

export const isFeedAudioCached = (itemId: string) => cache.has(itemId);

export const prefetchFeedAudio = (
  itemId: string,
  audioFilename?: string,
  audioUrl?: string,
): void => {
  const uri = resolveUri(itemId, audioFilename, audioUrl);
  if (!uri || cache.has(itemId) || inflight.has(itemId)) {
    return;
  }

  cancelled.delete(itemId);
  inflight.add(itemId);
  store.dispatch(setAudioLoading(itemId));

  const sound = new Sound(uri, '', error => {
    inflight.delete(itemId);

    if (error || cancelled.has(itemId)) {
      if (!error) {
        sound.release();
      }
      cancelled.delete(itemId);
      if (error) {
        store.dispatch(
          setAudioError({id: itemId, error: error.message ?? 'Load failed'}),
        );
      }
      return;
    }

    const duration = readSoundDuration(sound);
    cache.set(itemId, {
      sound,
      duration,
      lastAccess: Date.now(),
    });
    store.dispatch(setAudioReady({id: itemId, durationSec: duration}));
    evictIfNeeded(itemId);
  });
};

export type FeedAudioPrefetchTarget = {
  id: string;
  audioFilename?: string;
  audioUrl?: string;
};

export const prefetchFeedAudioBatch = (items: FeedAudioPrefetchTarget[]): void => {
  items.forEach(item => {
    prefetchFeedAudio(item.id, item.audioFilename, item.audioUrl);
  });
};

export const getCachedFeedAudio = (itemId: string): CachedAudio | null => {
  const entry = cache.get(itemId);
  if (!entry) {
    return null;
  }

  touchEntry(entry);
  const liveDuration = readSoundDuration(entry.sound);
  return {
    sound: entry.sound,
    duration: liveDuration > 0 ? liveDuration : entry.duration,
  };
};

export const waitForCachedFeedAudio = (
  itemId: string,
  maxWaitMs = 8000,
): Promise<CachedAudio | null> =>
  new Promise(resolve => {
    const startedAt = Date.now();

    const poll = () => {
      const cached = getCachedFeedAudio(itemId);
      if (cached) {
        resolve(cached);
        return;
      }

      const meta = store.getState().audioCache.byId[itemId];
      if (meta?.status === 'error') {
        resolve(null);
        return;
      }

      const elapsed = Date.now() - startedAt;
      if (!inflight.has(itemId) && elapsed > 300) {
        resolve(null);
        return;
      }

      if (elapsed >= maxWaitMs) {
        resolve(null);
        return;
      }

      setTimeout(poll, PRELOAD_POLL_MS);
    };

    poll();
  });

export const stopCachedFeedAudio = (itemId: string): void => {
  const entry = cache.get(itemId);
  if (!entry) {
    return;
  }
  entry.sound.stop();
  entry.sound.setCurrentTime(0);
};

export const releaseFeedAudioCache = (): void => {
  cancelled.clear();
  inflight.clear();
  cache.forEach(entry => {
    entry.sound.stop();
    entry.sound.release();
  });
  cache.clear();
  store.dispatch(clearAudioCache());
};

/** @deprecated Use getCachedFeedAudio — cache is no longer destructive */
export const takePreloadedFeedAudio = getCachedFeedAudio;

/** @deprecated Use stopCachedFeedAudio */
export const discardPreloadedFeedAudio = (itemId: string): void => {
  cancelled.add(itemId);
  inflight.delete(itemId);
  const entry = cache.get(itemId);
  if (entry) {
    entry.sound.stop();
    entry.sound.release();
    cache.delete(itemId);
    store.dispatch(clearAudioCacheEntry(itemId));
  }
};

/** @deprecated Use waitForCachedFeedAudio */
export const waitForPreloadedFeedAudio = waitForCachedFeedAudio;
