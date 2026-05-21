import React, {useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import type {EventArg} from '@react-navigation/native';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import CountiesScreen from '../screens/main/CountiesScreen';
import UsersScreen from '../screens/main/UsersScreen';
import KeywordsScreen from '../screens/main/KeywordsScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import SendersScreen from '../screens/main/SendersScreen';
import {TAB_BAR_HEIGHT} from '../utils/responsive';
import {useAppSelector} from '../redux/hooks';
import AndroidTabBar from './AndroidTabBar';
import IOSTabNavigator from './IOSTabNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import {adminTabConfig, userTabConfig} from './tabConfig';

const AndroidTab = createBottomTabNavigator();

const AndroidTabNavigator = ({isAdmin}: {isAdmin: boolean}) => {
  const tabConfig = isAdmin ? adminTabConfig : userTabConfig;
  const [settingsRoute, setSettingsRoute] = useState('Menu');

  const renderTabBar = (props: BottomTabBarProps) => {
    const focusedRoute = props.state.routes[props.state.index]?.name;
    const hideTabBar =
      focusedRoute === 'Settings' && settingsRoute !== 'Menu';

    if (hideTabBar) {
      return null;
    }

    return <AndroidTabBar {...props} tabConfig={tabConfig} />;
  };

  const onSettingsState = (
    e: EventArg<'state', false, {state?: {index: number; routes: {name: string}[]}}>,
  ) => {
    const state = e.data.state;
    if (state) {
      setSettingsRoute(state.routes[state.index]?.name ?? 'Menu');
    }
  };

  return (
    <AndroidTab.Navigator
      initialRouteName={isAdmin ? 'AdminConsole' : 'LiveFeed'}
      screenOptions={{
        headerShown: false,
        sceneStyle: androidStyles.scene,
      }}
      tabBar={renderTabBar}
    >
      {isAdmin ? (
        <>
          <AndroidTab.Screen name="AdminConsole">
            {() => <DashboardScreen />}
          </AndroidTab.Screen>
          <AndroidTab.Screen name="SystemStatus">
            {() => <SendersScreen />}
          </AndroidTab.Screen>
          <AndroidTab.Screen name="Keywords" component={KeywordsScreen} />
          <AndroidTab.Screen name="Users" component={UsersScreen} />
        </>
      ) : (
        <>
          <AndroidTab.Screen name="LiveFeed" component={CountiesScreen} />
          <AndroidTab.Screen name="LeadLog" component={UsersScreen} />
          <AndroidTab.Screen
            name="KeywordRequest"
            component={KeywordsScreen}
          />
          <AndroidTab.Screen
            name="Settings"
            component={SettingsStackNavigator}
            listeners={{state: onSettingsState}}
          />
        </>
      )}
    </AndroidTab.Navigator>
  );
};

const TabNavigator = () => {
  const role = useAppSelector(state => state.user.role) || 'user';
  const isAdmin = role === 'admin';

  if (Platform.OS === 'ios') {
    return <IOSTabNavigator isAdmin={isAdmin} />;
  }

  return <AndroidTabNavigator isAdmin={isAdmin} />;
};

const androidStyles = StyleSheet.create({
  scene: {
    backgroundColor: 'transparent',
    paddingBottom: TAB_BAR_HEIGHT,
  },
});

export default TabNavigator;
