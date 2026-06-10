import {useCallback, useEffect, useRef, useState} from 'react';
import Sound from 'react-native-sound';
import {getAudioFileUrl} from '../../../api';
import {getFeedAudioUri} from '../../../assets/audio';
import {
  discardPreloadedFeedAudio,
  takePreloadedFeedAudio,
} from './feedAudioPreload';
import type {PlaybackSpeed} from './PlaybackSpeedControl';

Sound.setCategory('Playback');

const POSITION_POLL_MS = 250;

export const useFeedAudioPlayer = (
  visible: boolean,
  itemId: string | undefined,
  audioFilename?: string,
  audioUrl?: string,
) => {
  const soundRef = useRef<Sound | null>(null);
  const loadSessionRef = useRef(0);
  const activeItemIdRef = useRef<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  const isSessionActive = useCallback(
    (session: number) => session === loadSessionRef.current,
    [],
  );

  const releaseSound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }
    setIsLoaded(false);
    setIsPlaying(false);
  }, []);

  const stopPlayback = useCallback(() => {
    loadSessionRef.current += 1;
    if (activeItemIdRef.current) {
      discardPreloadedFeedAudio(activeItemIdRef.current);
      activeItemIdRef.current = undefined;
    }
    releaseSound();
    setPositionSec(0);
    setDurationSec(0);
    setPlaybackSpeed(1);
  }, [releaseSound]);

  const prepareAudio = useCallback(
    (sound: Sound, duration: number, session: number) => {
      if (!isSessionActive(session)) {
        sound.stop();
        sound.release();
        return;
      }

      soundRef.current = sound;
      setDurationSec(duration);
      setIsLoaded(true);
      sound.setSpeed(1);
      sound.setCurrentTime(0);
      setPositionSec(0);
      setIsPlaying(false);
    },
    [isSessionActive],
  );

  useEffect(() => {
    if (!visible || !itemId) {
      stopPlayback();
      return;
    }

    loadSessionRef.current += 1;
    const session = loadSessionRef.current;
    activeItemIdRef.current = itemId;
    releaseSound();
    setPositionSec(0);
    setDurationSec(0);
    setPlaybackSpeed(1);

    const preloaded = takePreloadedFeedAudio(itemId);
    if (preloaded) {
      prepareAudio(preloaded.sound, preloaded.duration, session);
      return () => {
        if (activeItemIdRef.current === itemId) {
          stopPlayback();
        }
      };
    }

    const uri =
      audioUrl ??
      (audioFilename ? getAudioFileUrl(audioFilename) : getFeedAudioUri(itemId));
    if (!uri) {
      return;
    }

    const sound = new Sound(uri, '', error => {
      if (!isSessionActive(session)) {
        sound.release();
        return;
      }

      if (error) {
        return;
      }

      const duration = sound.getDuration();
      prepareAudio(sound, duration > 0 ? duration : 0, session);
    });

    return () => {
      if (activeItemIdRef.current === itemId) {
        stopPlayback();
      }
    };
  }, [
    visible,
    itemId,
    audioFilename,
    audioUrl,
    releaseSound,
    stopPlayback,
    prepareAudio,
    isSessionActive,
  ]);

  useEffect(() => {
    if (!visible || !isLoaded || !isPlaying) {
      return;
    }

    const intervalId = setInterval(() => {
      soundRef.current?.getCurrentTime(seconds => {
        setPositionSec(seconds);
      });
    }, POSITION_POLL_MS);

    return () => clearInterval(intervalId);
  }, [visible, isLoaded, isPlaying]);

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

    if (isPlaying) {
      sound.pause(() => setIsPlaying(false));
      return;
    }

    if (durationSec > 0 && positionSec >= durationSec) {
      sound.setCurrentTime(0);
      setPositionSec(0);
    }

    sound.play(success => {
      if (success) {
        setIsPlaying(false);
        setPositionSec(durationSec);
      }
    });
    setIsPlaying(true);
  }, [isPlaying, positionSec, durationSec]);

  const seekBy = useCallback(
    (delta: number) => {
      const sound = soundRef.current;
      if (!sound?.isLoaded()) {
        return;
      }
      const next = Math.max(0, Math.min(durationSec, positionSec + delta));
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
