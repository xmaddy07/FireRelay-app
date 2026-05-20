import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {BackHandler, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import SettingsMenu from './SettingsMenu';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
import SubscriptionSettings from './SubscriptionSettings';
import type {SettingsRoute} from './types';
import {useTheme} from '../../../theme';
import {TAB_BAR_HEIGHT} from '../../../utils/responsive';

type Props = {
  onNotificationPress?: () => void;
  onRouteChange?: (route: SettingsRoute) => void;
};

const SettingsScreen = ({onNotificationPress, onRouteChange}: Props) => {
  const {glass} = useTheme();
  const navigation = useNavigation();
  const [route, setRoute] = useState<SettingsRoute>('menu');

  const goBack = useCallback(() => setRoute('menu'), []);

  useEffect(() => {
    onRouteChange?.(route);
  }, [route, onRouteChange]);

  useLayoutEffect(() => {
    navigation.setOptions({
      sceneStyle: {
        backgroundColor: 'transparent',
        paddingBottom: route === 'menu' ? TAB_BAR_HEIGHT : 0,
      },
    });
  }, [navigation, route]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setRoute('menu');
        onRouteChange?.('menu');
      };
    }, [onRouteChange]),
  );

  useFocusEffect(
    useCallback(() => {
      if (route === 'menu') {
        return undefined;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          goBack();
          return true;
        },
      );

      return () => subscription.remove();
    }, [route, goBack]),
  );

  const renderRoute = () => {
    switch (route) {
      case 'profile':
        return <ProfileSettings onBack={goBack} />;
      case 'password':
        return <PasswordSettings onBack={goBack} />;
      case 'subscription':
        return <SubscriptionSettings onBack={goBack} />;
      case 'menu':
      default:
        return (
          <SettingsMenu
            onNavigate={setRoute}
            onNotificationPress={onNotificationPress}
          />
        );
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...glass.screenGradient]}
        start={{x: 0, y: 0}}
        end={{x: 0.4, y: 1}}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>{renderRoute()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default SettingsScreen;
export type {SettingsRoute} from './types';
