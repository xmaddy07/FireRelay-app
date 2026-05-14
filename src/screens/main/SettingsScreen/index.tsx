import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsMenu from './SettingsMenu';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
import SubscriptionSettings from './SubscriptionSettings';
import { Text } from 'react-native';

const Stack = createNativeStackNavigator();

type Props = {
  onOpenDrawer?: () => void;
};

const SettingsStack = ({ onOpenDrawer }: Props) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMenu">
        {(props) => <SettingsMenu {...props} onOpenDrawer={onOpenDrawer} />}
      </Stack.Screen>

      <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
      <Stack.Screen name="PasswordSettings" component={PasswordSettings} />
      <Stack.Screen name="SubscriptionSettings" component={SubscriptionSettings} />
    </Stack.Navigator>
  );
};

export default SettingsStack;
