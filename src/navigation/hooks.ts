import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {RootStackParamList} from './types';
import {openFeedAudioFromPush} from './navigationRef';

export const useOpenNotifications = () => {
  const navigation = useNavigation();

  return useCallback(() => {
    const parent = navigation.getParent();
    if (parent?.getState().routeNames.includes('Notifications')) {
      parent.navigate('Notifications' as keyof RootStackParamList);
      return;
    }

    navigation.navigate('Notifications' as never);
  }, [navigation]);
};

export const useOpenFeedAudio = () =>
  useCallback((audioId?: string) => {
    openFeedAudioFromPush(audioId);
  }, []);
