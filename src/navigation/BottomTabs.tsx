import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import LeadLogScreen from '../screens/main/leadLog';
import KeywordsScreen from '../screens/main/keyword';
import SendersScreen from '../screens/main/senders';
import {TAB_BAR_HEIGHT} from '../utils/responsive';
import {useRole} from '../hooks/useRole';
import AndroidTabBar from './AndroidTabBar';
import IOSTabNavigator from './IOSTabNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import CountiesScreen from '../screens/main/feeds';
import {getMainTabConfig} from './tabConfig';

const AndroidTab = createBottomTabNavigator();

const AndroidTabNavigator = ({isAdmin}: {isAdmin: boolean}) => {
  const tabConfig = getMainTabConfig();

  const renderTabBar = (props: BottomTabBarProps) => (
    <AndroidTabBar {...props} tabConfig={tabConfig} />
  );

  return (
    <AndroidTab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        sceneStyle: androidStyles.scene,
      }}
      tabBar={renderTabBar}
    >
      <AndroidTab.Screen name="Feed" component={CountiesScreen} />
      {isAdmin ? (
        <>
          <AndroidTab.Screen name="LeadLog" component={LeadLogScreen} />
          <AndroidTab.Screen name="Keywords" component={KeywordsScreen} />
          <AndroidTab.Screen name="Senders" component={SendersScreen} />
        </>
      ) : null}
      <AndroidTab.Screen name="Settings" component={SettingsStackNavigator} />
    </AndroidTab.Navigator>
  );
};

const TabNavigator = () => {
  const {isAdmin} = useRole();

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
