import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import SettingsMenu from '../screens/main/SettingsScreen/SettingsMenu';
import ProfileSettings from '../screens/main/SettingsScreen/ProfileSettings';
import PasswordSettings from '../screens/main/SettingsScreen/PasswordSettings';
import SubscriptionSettings from '../screens/main/SettingsScreen/SubscriptionSettings';
import {useTheme} from '../theme';
import type {SettingsStackParamList} from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator = () => {
  const {glass} = useTheme();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...glass.screenGradient]}
        start={{x: 0, y: 0}}
        end={{x: 0.4, y: 1}}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: styles.screen,
        }}
      >
        <Stack.Screen name="Menu" component={SettingsMenu} />
        <Stack.Screen name="Profile" component={ProfileSettings} />
        <Stack.Screen name="Password" component={PasswordSettings} />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionSettings}
        />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screen: {
    backgroundColor: 'transparent',
  },
});

export default SettingsStackNavigator;
