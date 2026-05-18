import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from '../screens/auth/LoginScreen';
import DrawerNavigator from '../drawer';
import {useAppSelector} from '../redux/hooks';

export const AppNavigator = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <DrawerNavigator />
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
};
