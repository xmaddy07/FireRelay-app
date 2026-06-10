import Sound from 'react-native-sound';
import {getAudioFileUrl} from '../../../api';
import {getFeedAudioUri} from '../../../assets/audio';

type CachedAudio = {
  sound: Sound;
  duration: number;
};

const cache = new Map<string, CachedAudio>();
const inflight = new Set<string>();
const cancelled = new Set<string>();

const resolveUri = (
  itemId: string,
  audioFilename?: string,
  audioUrl?: string,
) =>
  audioUrl ??
  (audioFilename ? getAudioFileUrl(audioFilename) : getFeedAudioUri(itemId));

export const preloadFeedAudio = (
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

  const sound = new Sound(uri, '', error => {
    inflight.delete(itemId);

    if (error || cancelled.has(itemId)) {
      if (!error) {
        sound.release();
      }
      cancelled.delete(itemId);
      return;
    }

    const duration = sound.getDuration();
    cache.set(itemId, {
      sound,
      duration: duration > 0 ? duration : 0,
    });
  });
};

export const takePreloadedFeedAudio = (itemId: string): CachedAudio | null => {
  const entry = cache.get(itemId);
  if (!entry) {
    return null;
  }
  cache.delete(itemId);
  cancelled.delete(itemId);
  return entry;
};

export const discardPreloadedFeedAudio = (itemId: string): void => {
  cancelled.add(itemId);
  inflight.delete(itemId);

  const entry = cache.get(itemId);
  if (entry) {
    entry.sound.stop();
    entry.sound.release();
    cache.delete(itemId);
  }
};
