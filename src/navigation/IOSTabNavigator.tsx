import React, {useMemo} from 'react';
import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import LeadLogScreen from '../screens/main/leadLog';
import KeywordsScreen from '../screens/main/keyword';
import SendersScreen from '../screens/main/senders';
import {useTheme} from '../config/theme';
import SettingsStackNavigator from './SettingsStackNavigator';
import CountiesScreen from '../screens/main/feeds';
import {
  getMainTabIosSymbols,
  getMainTabLabels,
  iosTabIcon,
  type MainTabRoute,
} from './tabConfig';

const Tab = createNativeBottomTabNavigator();

type Props = {
  isAdmin: boolean;
};

const screenOptionsFor =
  (
    symbols: ReturnType<typeof getMainTabIosSymbols>,
    labels: Record<MainTabRoute, string>,
  ) =>
  (routeName: MainTabRoute) => {
    const entry = symbols[routeName];
    const label = labels[routeName];

    return {
      title: label,
      tabBarLabel: label,
      tabBarIcon: iosTabIcon(entry),
    };
  };

const IOSTabNavigator = ({isAdmin}: Props) => {
  const {colors, isDark} = useTheme();
  const tabSymbols = getMainTabIosSymbols();
  const tabLabels = getMainTabLabels();
  const optionsFor = useMemo(
    () => screenOptionsFor(tabSymbols, tabLabels),
    [tabSymbols, tabLabels],
  );

  const tabBarInactiveTintColor = isDark ? colors.textSecondary : colors.textMuted;

  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarBlurEffect: isDark
          ? 'systemChromeMaterialDark'
          : 'systemChromeMaterialLight',
        tabBarStyle: {
          shadowColor: isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.12)',
        },
        tabBarControllerMode: 'tabBar',
        tabBarMinimizeBehavior: 'onScrollDown',
      }}
    >
      <Tab.Screen
        name="Feed"
        component={CountiesScreen}
        options={optionsFor('Feed')}
      />
      {isAdmin ? (
        <>
          <Tab.Screen
            name="LeadLog"
            component={LeadLogScreen}
            options={optionsFor('LeadLog')}
          />
          <Tab.Screen
            name="Keywords"
            component={KeywordsScreen}
            options={optionsFor('Keywords')}
          />
          <Tab.Screen
            name="Senders"
            component={SendersScreen}
            options={optionsFor('Senders')}
          />
        </>
      ) : null}
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={optionsFor('Settings')}
      />
    </Tab.Navigator>
  );
};

export default IOSTabNavigator;
