import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from '../screens/auth/LoginScreen';
import TabNavigator from './TabNavigator';
import {useAppSelector} from '../redux/hooks';

export const AppNavigator = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
};
