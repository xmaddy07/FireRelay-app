import React, {useEffect, useState} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import NotificationsScreen from '../screens/main/notification';
import SplashAnimatedScreen from '../screens/auth/splashanimated';
import {useAppSelector} from '../redux/hooks';
import {useTheme} from '../config/theme';
import AuthNavigator from './AuthNavigator';
import BottomTabs from './BottomTabs';
import type {RootStackParamList} from './types';
import {flushPendingFeedAudioNavigation} from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

let initialSplashComplete = false;

const MainWithBackground = () => {
  const {glass} = useTheme();

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      locations={[0, 0.5, 1]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.main}
    >
      <BottomTabs />
    </LinearGradient>
  );
};

const NotificationsModalScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return <NotificationsScreen onBack={() => navigation.goBack()} />;
};

const RootNavigator = () => {
  const [showSplash, setShowSplash] = useState(!initialSplashComplete);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const {colors, isDark} = useTheme();
  const notificationScreenBackground = isDark ? colors.black : colors.white;

  useEffect(() => {
    if (isAuthenticated) {
      flushPendingFeedAudioNavigation();
    }
  }, [isAuthenticated]);

  if (showSplash) {
    return (
      <SplashAnimatedScreen
        onFinish={() => {
          initialSplashComplete = true;
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: 'transparent'},
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainWithBackground} />
          <Stack.Screen
            name="Notifications"
            component={NotificationsModalScreen}
            options={{
              presentation: 'modal',
              animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_right',
              headerShown: false,
              contentStyle: {
                backgroundColor: notificationScreenBackground,
              },
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
});

export default RootNavigator;
