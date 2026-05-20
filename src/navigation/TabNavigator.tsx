import React, {useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import CountiesScreen from '../screens/main/CountiesScreen';
import UsersScreen from '../screens/main/UsersScreen';
import KeywordsScreen from '../screens/main/KeywordsScreen';
import SettingsScreen, {
  type SettingsRoute,
} from '../screens/main/SettingsScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import SendersScreen from '../screens/main/SendersScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import {images} from '../constants';
import {useTheme} from '../theme';
import {TAB_BAR_HEIGHT} from '../utils/responsive';
import {useAppSelector} from '../redux/hooks';
import LiquidGlassTabBar, {type TabBarConfig} from './LiquidGlassTabBar';

const Tab = createBottomTabNavigator();

const userTabConfig: Record<string, TabBarConfig> = {
  LiveFeed: {label: 'Live Feed', icon: images.home},
  LeadLog: {label: 'Lead Log', icon: images.users},
  KeywordRequest: {label: 'Keyword', icon: images.keyword},
  Settings: {label: 'Settings', icon: images.senders},
};

const adminTabConfig: Record<string, TabBarConfig> = {
  AdminConsole: {label: 'Admin', icon: images.setting},
  SystemStatus: {label: 'Status', icon: images.home},
  Keywords: {label: 'Keywords', icon: images.keyword},
  Users: {label: 'Users', icon: images.users},
};

const TabNavigator = () => {
  const {glass} = useTheme();
  const role = useAppSelector(state => state.user.role) || 'user';
  const isAdmin = role === 'admin';
  const tabConfig = isAdmin ? adminTabConfig : userTabConfig;

  const [notifMounted, setNotifMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [settingsRoute, setSettingsRoute] = useState<SettingsRoute>('menu');
  const notifSlide = useRef(new Animated.Value(1)).current;

  const renderTabBar = (props: React.ComponentProps<typeof LiquidGlassTabBar>) => {
    const focusedRoute = props.state.routes[props.state.index]?.name;
    const hideTabBar = focusedRoute === 'Settings' && settingsRoute !== 'menu';

    if (hideTabBar) {
      return null;
    }

    return <LiquidGlassTabBar {...props} tabConfig={tabConfig} />;
  };

  const openNotifications = () => {
    setNotifMounted(true);
    setShowNotifications(true);
    Animated.spring(notifSlide, {
      toValue: 0,
      friction: 9,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const closeNotifications = () => {
    setShowNotifications(false);
    Animated.timing(notifSlide, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setNotifMounted(false));
  };

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      locations={[0, 0.5, 1]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <Tab.Navigator
        initialRouteName={isAdmin ? 'AdminConsole' : 'LiveFeed'}
        screenOptions={{
          headerShown: false,
          sceneStyle: styles.scene,
        }}
        tabBar={renderTabBar}
      >
        {isAdmin ? (
          <>
            <Tab.Screen name="AdminConsole">
              {() => <DashboardScreen />}
            </Tab.Screen>
            <Tab.Screen name="SystemStatus">
              {() => <SendersScreen />}
            </Tab.Screen>
            <Tab.Screen name="Keywords" component={KeywordsScreen} />
            <Tab.Screen name="Users" component={UsersScreen} />
          </>
        ) : (
          <>
            <Tab.Screen name="LiveFeed">
              {() => <CountiesScreen onNotificationPress={openNotifications} />}
            </Tab.Screen>
            <Tab.Screen name="LeadLog">
              {() => <UsersScreen onNotificationPress={openNotifications} />}
            </Tab.Screen>
            <Tab.Screen name="KeywordRequest">
              {() => <KeywordsScreen onNotificationPress={openNotifications} />}
            </Tab.Screen>
            <Tab.Screen name="Settings">
              {() => (
                <SettingsScreen
                  onNotificationPress={openNotifications}
                  onRouteChange={setSettingsRoute}
                />
              )}
            </Tab.Screen>
          </>
        )}
      </Tab.Navigator>

      {notifMounted && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.notificationsOverlay,
            {
              transform: [
                {
                  translateX: notifSlide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 500],
                  }),
                },
              ],
            },
          ]}
        >
          <NotificationsScreen onBack={closeNotifications} />
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scene: {
    backgroundColor: 'transparent',
    paddingBottom: TAB_BAR_HEIGHT,
  },
  notificationsOverlay: {
    zIndex: 50,
  },
});

export default TabNavigator;
