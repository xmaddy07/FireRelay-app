import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from '../screens/auth/LoginScreen';
import DrawerNavigator from '../drawer';

export const AppNavigator = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <NavigationContainer>
      {isSignedIn ? (
        <DrawerNavigator />
      ) : (
        <LoginScreen onSignIn={() => setIsSignedIn(true)} />
      )}
    </NavigationContainer>
  );
};
