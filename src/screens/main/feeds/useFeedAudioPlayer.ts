import {useCallback, useEffect, useRef, useState} from 'react';
import Sound from 'react-native-sound';
import {getAudioFileUrl} from '../../../api';
import {getFeedAudioUri} from '../../../assets/audio';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

  const releaseSound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }
    setIsLoaded(false);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!visible || !itemId) {
      releaseSound();
      setPositionSec(0);
      setDurationSec(0);
      setPlaybackSpeed(1);
      return;
    }

    const uri =
      audioUrl ??
      (audioFilename ? getAudioFileUrl(audioFilename) : getFeedAudioUri(itemId));
    if (!uri) {
      return;
    }

    releaseSound();
    setPositionSec(0);
    setDurationSec(0);
    setPlaybackSpeed(1);

    const sound = new Sound(uri, '', error => {
      if (error) {
        return;
      }

      soundRef.current = sound;
      const duration = sound.getDuration();
      setDurationSec(duration > 0 ? duration : 0);
      setIsLoaded(true);
      sound.setSpeed(1);
      sound.play(success => {
        if (success) {
          setIsPlaying(false);
          setPositionSec(duration > 0 ? duration : 0);
        }
      });
      setIsPlaying(true);
    });

    return releaseSound;
  }, [visible, itemId, audioFilename, audioUrl, releaseSound]);

  useEffect(() => {
    if (!visible || !isLoaded) {
      return;
    }

    const intervalId = setInterval(() => {
      soundRef.current?.getCurrentTime((seconds, playing) => {
        setPositionSec(seconds);
        setIsPlaying(playing);
      });
    }, POSITION_POLL_MS);

    return () => clearInterval(intervalId);
  }, [visible, isLoaded]);

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
  };
};
