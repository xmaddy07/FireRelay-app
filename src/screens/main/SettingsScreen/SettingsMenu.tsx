import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {GlassView} from '../../../components/LiquidGlass';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../theme';
import {useAppDispatch} from '../../../redux/hooks';
import {authActions} from '../../../redux/slices/authSlice';
import {userActions} from '../../../redux/slices/userSlice';
import AnimatedToggle from './components/AnimatedToggle';
import AnimatedBellIcon from './components/AnimatedBellIcon';
import AnimatedMoonIcon from './components/AnimatedMoonIcon';
import AccountNavRow from './components/AccountNavRow';
import AnimatedLogoutButton from './components/AnimatedLogoutButton';
import SettingsScreenLayout from './SettingsScreenLayout';
import type {SettingsRoute} from './types';

type Props = {
  onNavigate: (route: SettingsRoute) => void;
  onNotificationPress?: () => void;
};

const ACCOUNT_ITEMS: {
  key: string;
  label: string;
  icon: string;
  route: SettingsRoute;
}[] = [
  {key: 'profile', label: 'Profile', icon: 'user', route: 'profile'},
  {key: 'password', label: 'Password', icon: 'lock', route: 'password'},
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    icon: 'creditcard',
    route: 'subscription',
  },
];

const SettingsMenu = ({onNavigate, onNotificationPress}: Props) => {
  const dispatch = useAppDispatch();
  const {colors, glass, isDark, toggleTheme} = useTheme();
  const styles = useThemedStyles(createStyles);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [bellRing, setBellRing] = useState(0);
  const [moonPulse, setMoonPulse] = useState(0);

  const handleLogout = () => {
    dispatch(authActions.logout());
    dispatch(userActions.clearUser());
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
    <SettingsScreenLayout
      title="Settings"
      subtitle="Manage your account settings and preferences."
      layout="stacked"
      showNotification
      onNotificationPress={onNotificationPress}
    >
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
            onPress={() => onNavigate(item.route)}
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
