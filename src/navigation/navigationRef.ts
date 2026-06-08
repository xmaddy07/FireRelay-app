import {createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from './types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

let pendingFeedAudioId: string | null = null;

export const openFeedAudioFromPush = (audioId?: string) => {
  const trimmed = audioId?.trim();
  if (!trimmed) {
    return;
  }

  const navigate = () => {
    navigationRef.navigate('Main', {
      screen: 'Feed',
      params: {audioId: trimmed},
    });
  };

  if (navigationRef.isReady()) {
    navigate();
    return;
  }

  pendingFeedAudioId = trimmed;
};

export const flushPendingFeedAudioNavigation = () => {
  if (!pendingFeedAudioId || !navigationRef.isReady()) {
    return;
  }

  const audioId = pendingFeedAudioId;
  pendingFeedAudioId = null;
  openFeedAudioFromPush(audioId);
};
