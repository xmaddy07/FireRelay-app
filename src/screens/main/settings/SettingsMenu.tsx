import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {images} from '../../../config/constants';
import {GlassView} from '../../../components/feed/LiquidGlass';
import {useOpenNotifications} from '../../../navigation/hooks';
import type {SettingsStackParamList} from '../../../navigation/types';
import {responsiveHitSlop} from '../../../utils/responsive';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {ApiError, logout} from '../../../api';
import {useAppDispatch} from '../../../redux/hooks';
import {useAuth} from '../../../hooks/useAuth';
import {authActions} from '../../../redux/slices/authSlice';
import {userActions} from '../../../redux/slices/userSlice';
import AnimatedToggle from './components/AnimatedToggle';
import AnimatedBellIcon from './components/AnimatedBellIcon';
import AnimatedMoonIcon from './components/AnimatedMoonIcon';
import AccountNavRow from './components/AccountNavRow';
import AnimatedLogoutButton from './components/AnimatedLogoutButton';
import SettingsScreenLayout from './SettingsScreenLayout';

const ACCOUNT_ITEMS: {
  key: string;
  label: string;
  icon: string;
  route: keyof SettingsStackParamList;
}[] = [
  {key: 'profile', label: 'Profile', icon: 'user', route: 'Profile'},
  {key: 'password', label: 'Password', icon: 'lock', route: 'Password'},
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    icon: 'credit-card',
    route: 'Subscription',
  },
];

const SettingsMenu = () => {
  const openNotifications = useOpenNotifications();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const dispatch = useAppDispatch();
  const {token} = useAuth();
  const {colors, glass, isDark, toggleTheme} = useTheme();
  const styles = useThemedStyles(createStyles);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [bellRing, setBellRing] = useState(0);
  const [moonPulse, setMoonPulse] = useState(0);

  const handleLogout = async () => {
    try {
      await logout(token);
    } catch (error) {
      if (__DEV__ && error instanceof ApiError) {
        console.warn('[API] logout failed:', error.message);
      }
    } finally {
      dispatch(authActions.logout());
      dispatch(userActions.clearUser());
    }
  };

  const handlePushToggle = (next: boolean) => {
    setPushEnabled(next);
    if (next) {
      setBellRing(n => n + 1);
    }
  };

  const handleDarkModeToggle = (next: boolean) => {
    if (next !== isDark) {
      toggleTheme();
    }
    setMoonPulse(n => n + 1);
  };

  return (
    <SettingsScreenLayout>
      <View style={styles.screenHeader}>
        <View style={styles.screenHeaderText}>
          <Text style={styles.screenTitle} numberOfLines={2}>
            Settings
          </Text>
          <Text style={styles.screenSubtitle}>
            Manage your account settings and preferences.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerNotificationButton}
          activeOpacity={0.7}
          onPress={openNotifications}
          hitSlop={responsiveHitSlop(2)}
        >
          <Image
            source={images.notification}
            style={styles.notificationIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, styles.sectionLabelFirst]}>
        PREFERENCES
      </Text>
      <GlassView
        effect="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={glass.settingsCardTint}
        style={styles.glassCard}
        fallbackStyle={glass.fallback.settingsCard}
        showHighlight={false}
        pointerEvents="box-none"
      >
        <View style={styles.settingRow} pointerEvents="box-none">
          <View style={[styles.iconBox, styles.iconBoxAccent]}>
            <AnimatedBellIcon color={colors.primary} ringTrigger={bellRing} />
          </View>
          <View style={styles.settingTextBlock}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text
              style={[
                styles.settingSubtitle,
                pushEnabled && styles.settingSubtitleActive,
              ]}
            >
              Real-time status updates
            </Text>
          </View>
          <AnimatedToggle
            value={pushEnabled}
            onValueChange={handlePushToggle}
            trackOnColor={colors.primary}
            trackOffColor={colors.borderMuted}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.preferenceDivider} />

        <View style={styles.settingRow}>
          <View style={[styles.iconBox, styles.iconBoxAccent]}>
            <AnimatedMoonIcon color={colors.primary} pulseTrigger={moonPulse} />
          </View>
          <View style={styles.settingTextBlock}>
            <Text style={styles.settingTitle}>Dark mode</Text>
            <Text
              style={[
                styles.settingSubtitle,
                isDark && styles.settingSubtitleActive,
              ]}
            >
              {isDark ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          <AnimatedToggle
            value={isDark}
            onValueChange={handleDarkModeToggle}
            trackOnColor={colors.primary}
            trackOffColor={colors.borderMuted}
            thumbColor={colors.white}
          />
        </View>
      </GlassView>

      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <GlassView
        effect="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={glass.settingsCardTint}
        style={styles.glassCard}
        fallbackStyle={glass.fallback.settingsCard}
        showHighlight={false}
        pointerEvents="box-none"
      >
        {ACCOUNT_ITEMS.map((item, index) => (
          <AccountNavRow
            key={item.key}
            label={item.label}
            icon={item.icon}
            onPress={() => navigation.navigate(item.route)}
            showDivider={index < ACCOUNT_ITEMS.length - 1}
            styles={styles}
            colors={colors}
          />
        ))}
      </GlassView>

      <AnimatedLogoutButton
        onPress={handleLogout}
        label="Log Out"
        iconColor={colors.primary}
        textStyle={styles.logoutText}
        buttonStyle={styles.logoutButton}
        iconStyle={styles.logoutIconVector}
      />
    </SettingsScreenLayout>
  );
};

export default SettingsMenu;
