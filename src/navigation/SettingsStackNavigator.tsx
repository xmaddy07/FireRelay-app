import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SettingsMenu from '../screens/main/settings/SettingsMenu';
import ProfileSettings from '../screens/main/settings/ProfileSettings';
import ProfileEmailOtp from '../screens/main/settings/ProfileEmailOtp';
import PasswordSettings from '../screens/main/settings/PasswordSettings';
import SubscriptionSettings from '../screens/main/settings/SubscriptionSettings';
import {useTheme} from '../config/theme';
import type {SettingsStackParamList} from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const childScreenOptions = (backgroundColor: string) => ({
  contentStyle: {backgroundColor},
});

const SettingsStackNavigator = () => {
  const {colors} = useTheme();

  return (
    <View style={styles.root}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          freezeOnBlur: true,
        }}
      >
        <Stack.Screen
          name="Menu"
          component={SettingsMenu}
          options={{contentStyle: styles.menuScreen}}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileSettings}
          options={childScreenOptions(colors.background)}
        />
        <Stack.Screen
          name="ProfileEmailOtp"
          component={ProfileEmailOtp}
          options={childScreenOptions(colors.background)}
        />
        <Stack.Screen
          name="Password"
          component={PasswordSettings}
          options={childScreenOptions(colors.background)}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionSettings}
          options={childScreenOptions(colors.background)}
        />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  menuScreen: {
    backgroundColor: 'transparent',
  },
});

export default SettingsStackNavigator;
