import React, {useMemo} from 'react';
import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import CountiesScreen from '../screens/main/CountiesScreen';
import UsersScreen from '../screens/main/UsersScreen';
import KeywordsScreen from '../screens/main/KeywordsScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import SendersScreen from '../screens/main/SendersScreen';
import {useTheme} from '../theme';
import SettingsStackNavigator from './SettingsStackNavigator';
import {
  adminTabIosSymbols,
  adminTabLabels,
  iosTabIcon,
  userTabIosSymbols,
  userTabLabels,
} from './tabConfig';

const Tab = createNativeBottomTabNavigator();

type Props = {
  isAdmin: boolean;
};

const screenOptionsFor =
  (
    symbols: typeof userTabIosSymbols,
    labels: Record<string, string>,
  ) =>
  (routeName: string) => {
    const entry = symbols[routeName as keyof typeof symbols];
    const label = labels[routeName];
    if (!entry || !label) {
      return {};
    }

    return {
      title: label,
      tabBarLabel: label,
      tabBarIcon: iosTabIcon(entry),
    };
  };

const IOSTabNavigator = ({isAdmin}: Props) => {
  const {colors, isDark} = useTheme();
  const tabSymbols = isAdmin ? adminTabIosSymbols : userTabIosSymbols;
  const tabLabels = isAdmin ? adminTabLabels : userTabLabels;
  const optionsFor = useMemo(
    () => screenOptionsFor(tabSymbols, tabLabels),
    [tabSymbols, tabLabels],
  );

  const tabBarInactiveTintColor = isDark ? colors.textSecondary : colors.textMuted;

  return (
    <Tab.Navigator
      initialRouteName={isAdmin ? 'AdminConsole' : 'LiveFeed'}
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
      {isAdmin ? (
        <>
          <Tab.Screen
            name="AdminConsole"
            options={optionsFor('AdminConsole')}
          >
            {() => <DashboardScreen />}
          </Tab.Screen>
          <Tab.Screen
            name="SystemStatus"
            options={optionsFor('SystemStatus')}
          >
            {() => <SendersScreen />}
          </Tab.Screen>
          <Tab.Screen
            name="Keywords"
            component={KeywordsScreen}
            options={optionsFor('Keywords')}
          />
          <Tab.Screen
            name="Users"
            component={UsersScreen}
            options={optionsFor('Users')}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="LiveFeed"
            component={CountiesScreen}
            options={optionsFor('LiveFeed')}
          />
          <Tab.Screen
            name="LeadLog"
            component={UsersScreen}
            options={optionsFor('LeadLog')}
          />
          <Tab.Screen
            name="KeywordRequest"
            component={KeywordsScreen}
            options={optionsFor('KeywordRequest')}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsStackNavigator}
            options={optionsFor('Settings')}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

export default IOSTabNavigator;
