import React, {useMemo} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useAppSelector} from '../redux/hooks';
import {useTheme} from '../config/theme';
import {createNavigationTheme} from '../config/theme/navigationTheme';
import RootNavigator from './RootNavigator';

export const AppNavigator = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const {colors, isDark} = useTheme();
  const navigationTheme = useMemo(
    () => createNavigationTheme(colors, isDark),
    [colors, isDark],
  );

  return (
    <NavigationContainer
      key={isAuthenticated ? 'auth' : 'guest'}
      theme={navigationTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
};
