import {useCallback, useEffect, useRef, useState} from 'react';
import Sound from 'react-native-sound';
import {useAppSelector} from '../../../redux/hooks';
import {
  getCachedFeedAudio,
  prefetchFeedAudio,
  stopCachedFeedAudio,
  waitForCachedFeedAudio,
} from './feedAudioPreload';
import type {PlaybackSpeed} from './PlaybackSpeedControl';

Sound.setCategory('Playback');

const POSITION_POLL_MS = 100;
const DURATION_RESOLVE_MS = 100;
const MAX_DURATION_RESOLVE_ATTEMPTS = 30;

const readSoundDuration = (sound: Sound) => {
  const duration = sound.getDuration();
  return duration > 0 ? duration : 0;
};

export const useFeedAudioPlayer = (
  visible: boolean,
  itemId: string | undefined,
  audioFilename?: string,
  audioUrl?: string,
) => {
  const soundRef = useRef<Sound | null>(null);
  const loadSessionRef = useRef(0);
  const activeItemIdRef = useRef<string | undefined>(undefined);
  const durationResolveTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const cachedDurationSec = useAppSelector(state =>
    itemId ? state.audioCache.byId[itemId]?.durationSec : undefined,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const durationSecRef = useRef(0);

  const isSessionActive = useCallback(
    (session: number) => session === loadSessionRef.current,
    [],
  );

  const clearDurationResolveTimer = useCallback(() => {
    if (durationResolveTimerRef.current) {
      clearInterval(durationResolveTimerRef.current);
      durationResolveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    durationSecRef.current = durationSec;
  }, [durationSec]);

  const syncPosition = useCallback(() => {
    const sound = soundRef.current;
    if (!sound?.isLoaded()) {
      return;
    }

    sound.getCurrentTime((seconds, nativePlaying) => {
      setPositionSec(seconds);

      if (nativePlaying) {
        setIsPlaying(true);
      }

      if (durationSecRef.current <= 0) {
        const duration = readSoundDuration(sound);
        if (duration > 0) {
          setDurationSec(duration);
        }
      }
    });
  }, []);

  const resolveDuration = useCallback(
    (sound: Sound, session: number) => {
      const duration = readSoundDuration(sound);
      if (duration > 0) {
        setDurationSec(duration);
        return;
      }

      clearDurationResolveTimer();
      let attempts = 0;

      durationResolveTimerRef.current = setInterval(() => {
        if (!isSessionActive(session) || soundRef.current !== sound) {
          clearDurationResolveTimer();
          return;
        }

        const nextDuration = readSoundDuration(sound);
        if (nextDuration > 0) {
          setDurationSec(nextDuration);
          clearDurationResolveTimer();
          return;
        }

        attempts += 1;
        if (attempts >= MAX_DURATION_RESOLVE_ATTEMPTS) {
          clearDurationResolveTimer();
        }
      }, DURATION_RESOLVE_MS);
    },
    [clearDurationResolveTimer, isSessionActive],
  );

  const detachSound = useCallback(() => {
    clearDurationResolveTimer();
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current = null;
    }
    setIsLoaded(false);
    setIsPlaying(false);
  }, [clearDurationResolveTimer]);

  const stopPlayback = useCallback(() => {
    loadSessionRef.current += 1;
    if (activeItemIdRef.current) {
      stopCachedFeedAudio(activeItemIdRef.current);
      activeItemIdRef.current = undefined;
    }
    detachSound();
    setPositionSec(0);
    setDurationSec(0);
    setPlaybackSpeed(1);
  }, [detachSound]);

  const prepareAudio = useCallback(
    (sound: Sound, duration: number, session: number) => {
      if (!isSessionActive(session)) {
        return;
      }

      sound.stop();
      soundRef.current = sound;
      setDurationSec(duration > 0 ? duration : cachedDurationSec ?? 0);
      setIsLoaded(true);
      sound.setSpeed(1);
      sound.setCurrentTime(0);
      setPositionSec(0);
      setIsPlaying(false);
      resolveDuration(sound, session);
    },
    [isSessionActive, resolveDuration, cachedDurationSec],
  );

  useEffect(() => {
    if (!visible || !itemId) {
      stopPlayback();
      return;
    }

    loadSessionRef.current += 1;
    const session = loadSessionRef.current;
    activeItemIdRef.current = itemId;
    detachSound();
    setPositionSec(0);
    setDurationSec(cachedDurationSec ?? 0);
    setPlaybackSpeed(1);

    let disposed = false;

    const attachCached = (cached: {sound: Sound; duration: number}) => {
      if (disposed || !isSessionActive(session)) {
        return;
      }
      prepareAudio(cached.sound, cached.duration, session);
    };

    const ensureCached = () => {
      prefetchFeedAudio(itemId, audioFilename, audioUrl);
      void waitForCachedFeedAudio(itemId).then(cached => {
        if (disposed || !isSessionActive(session)) {
          return;
        }
        if (cached) {
          attachCached(cached);
        }
      });
    };

    const immediate = getCachedFeedAudio(itemId);
    if (immediate) {
      attachCached(immediate);
    } else {
      ensureCached();
    }

    return () => {
      disposed = true;
      if (activeItemIdRef.current === itemId) {
        stopPlayback();
      }
    };
  }, [
    visible,
    itemId,
    audioFilename,
    audioUrl,
    cachedDurationSec,
    detachSound,
    stopPlayback,
    prepareAudio,
    isSessionActive,
  ]);

  useEffect(() => {
    if (!visible || !isLoaded) {
      return;
    }

    syncPosition();
    const intervalId = setInterval(syncPosition, POSITION_POLL_MS);
    return () => clearInterval(intervalId);
  }, [visible, isLoaded, syncPosition]);

  useEffect(() => {
    if (!soundRef.current?.isLoaded()) {
      return;
    }
    soundRef.current.setSpeed(playbackSpeed);
  }, [playbackSpeed, isLoaded]);

  const togglePlay = useCallback(() => {
    const sound = soundRef.current;
    if (!sound?.isLoaded()) {
      return;
    }

    const session = loadSessionRef.current;

    if (isPlaying) {
      sound.pause(() => {
        if (isSessionActive(session)) {
          setIsPlaying(false);
        }
      });
      return;
    }

    if (durationSec > 0 && positionSec >= durationSec) {
      sound.setCurrentTime(0);
      setPositionSec(0);
    }

    sound.play(success => {
      if (!isSessionActive(session)) {
        return;
      }
      setIsPlaying(false);
      if (success) {
        const finalDuration = readSoundDuration(sound) || durationSec;
        setPositionSec(finalDuration > 0 ? finalDuration : 0);
      }
    });
    setIsPlaying(true);
    syncPosition();
    resolveDuration(sound, session);
  }, [
    isPlaying,
    positionSec,
    durationSec,
    syncPosition,
    resolveDuration,
    isSessionActive,
  ]);

  const seekBy = useCallback(
    (delta: number) => {
      const sound = soundRef.current;
      if (!sound?.isLoaded()) {
        return;
      }
      const maxDuration =
        durationSec > 0 ? durationSec : readSoundDuration(sound);
      const next = Math.max(
        0,
        Math.min(
          maxDuration > 0 ? maxDuration : positionSec + Math.abs(delta),
          positionSec + delta,
        ),
      );
      sound.setCurrentTime(next);
      setPositionSec(next);
    },
    [positionSec, durationSec],
  );

  return {
    isPlaying,
    positionSec,
    durationSec,
    playbackSpeed,
    setPlaybackSpeed,
    togglePlay,
    seekBy,
    isLoaded,
    stopPlayback,
  };
};
