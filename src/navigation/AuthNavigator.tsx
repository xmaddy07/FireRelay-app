import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/Login';
import {routes} from './routes';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name={routes.auth.login} component={LoginScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
