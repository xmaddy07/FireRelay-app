import React, {useMemo} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useTheme} from '../config/theme';
import {createNavigationTheme} from '../config/theme/navigationTheme';
import RootNavigator from './RootNavigator';
import {
  flushPendingFeedAudioNavigation,
  navigationRef,
} from './navigationRef';

export const AppNavigator = () => {
  const {colors, isDark} = useTheme();
  const navigationTheme = useMemo(
    () => createNavigationTheme(colors, isDark),
    [colors, isDark],
  );

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={flushPendingFeedAudioNavigation}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};
