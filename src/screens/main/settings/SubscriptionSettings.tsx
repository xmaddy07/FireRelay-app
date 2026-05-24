import React, {useCallback, useMemo, useState} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {Button} from '../../../components';
import {GlassView} from '../../../components/feed/LiquidGlass';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {wp} from '../../../utils/responsive';
import SettingsScreenLayout from './SettingsScreenLayout';
import AnimatedToggle from './components/AnimatedToggle';

type SeverityKey = 'critical' | 'high' | 'medium' | 'low';

type SeverityTheme = {
  accent: string;
  iconBg: string;
  iconBorder: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
};

type SeverityIcon = 'alert-octagon' | 'alert-triangle' | 'alert-circle' | 'bell';

type SeveritySubscription = {
  key: SeverityKey;
  badge: string;
  title: string;
  description: string;
  icon: SeverityIcon;
};

const SEVERITY_SUBSCRIPTIONS: SeveritySubscription[] = [
  {
    key: 'critical',
    badge: 'Critical',
    title: 'Critical alerts',
    description: 'Email notifications for critical keyword matches.',
    icon: 'alert-octagon',
  },
  {
    key: 'high',
    badge: 'High',
    title: 'High alerts',
    description: 'Email notifications for high-priority keyword matches.',
    icon: 'alert-triangle',
  },
  {
    key: 'medium',
    badge: 'Medium',
    title: 'Medium alerts',
    description: 'Email notifications for medium-priority keyword matches.',
    icon: 'alert-circle',
  },
  {
    key: 'low',
    badge: 'Low',
    title: 'Low alerts',
    description: 'Email notifications for low-priority keyword matches.',
    icon: 'bell',
  },
];

const defaultPreferences: Record<SeverityKey, boolean> = {
  critical: true,
  high: true,
  medium: true,
  low: true,
};

const getSeverityThemes = (isDark: boolean): Record<SeverityKey, SeverityTheme> => ({
  critical: {
    accent: '#F87171',
    iconBg: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.12)',
    iconBorder: isDark ? 'rgba(239, 68, 68, 0.34)' : 'rgba(239, 68, 68, 0.24)',
    badgeBg: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.12)',
    badgeBorder: isDark ? 'rgba(239, 68, 68, 0.32)' : 'rgba(239, 68, 68, 0.2)',
    badgeText: isDark ? '#FCA5A5' : '#B91C1C',
  },
  high: {
    accent: '#FB923C',
    iconBg: isDark ? 'rgba(249, 115, 22, 0.16)' : 'rgba(249, 115, 22, 0.12)',
    iconBorder: isDark ? 'rgba(249, 115, 22, 0.34)' : 'rgba(249, 115, 22, 0.24)',
    badgeBg: isDark ? 'rgba(249, 115, 22, 0.18)' : 'rgba(249, 115, 22, 0.12)',
    badgeBorder: isDark ? 'rgba(249, 115, 22, 0.32)' : 'rgba(249, 115, 22, 0.2)',
    badgeText: isDark ? '#FDBA74' : '#C2410C',
  },
  medium: {
    accent: '#FACC15',
    iconBg: isDark ? 'rgba(234, 179, 8, 0.16)' : 'rgba(234, 179, 8, 0.14)',
    iconBorder: isDark ? 'rgba(234, 179, 8, 0.34)' : 'rgba(234, 179, 8, 0.24)',
    badgeBg: isDark ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.14)',
    badgeBorder: isDark ? 'rgba(234, 179, 8, 0.32)' : 'rgba(234, 179, 8, 0.22)',
    badgeText: isDark ? '#FDE047' : '#A16207',
  },
  low: {
    accent: '#94A3B8',
    iconBg: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.14)',
    iconBorder: isDark ? 'rgba(148, 163, 184, 0.34)' : 'rgba(148, 163, 184, 0.24)',
    badgeBg: isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.14)',
    badgeBorder: isDark ? 'rgba(148, 163, 184, 0.32)' : 'rgba(148, 163, 184, 0.22)',
    badgeText: isDark ? '#CBD5E1' : '#475569',
  },
});

const SubscriptionSettings = () => {
  const navigation = useNavigation();
  const {colors, glass, isDark} = useTheme();
  const styles = useThemedStyles(createStyles);
  const severityThemes = useMemo(() => getSeverityThemes(isDark), [isDark]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [savedPreferences, setSavedPreferences] = useState(defaultPreferences);

  const activeCount = SEVERITY_SUBSCRIPTIONS.filter(
    item => preferences[item.key],
  ).length;

  const handleToggle = useCallback((key: SeverityKey, value: boolean) => {
    setPreferences(prev => ({...prev, [key]: value}));
  }, []);

  const handleSave = useCallback(() => {
    setSavedPreferences(preferences);
    console.log('Email subscription preferences:', preferences);
  }, [preferences]);

  const hasChanges = SEVERITY_SUBSCRIPTIONS.some(
    item => preferences[item.key] !== savedPreferences[item.key],
  );

  return (
    <SettingsScreenLayout
      title="Preferences"
      showBack
      onBackPress={() => navigation.goBack()}
    >

      <View style={styles.subscriptionIntro}>
        <Text style={styles.subscriptionHeroTitle}>Alert Preferences</Text>
        <Text style={styles.subscriptionHeroDesc}>
          Choose which keyword severity levels trigger alerts.
        </Text>
        <View style={styles.subscriptionSummaryChip}>
          <View style={styles.subscriptionSummaryDot} />
          <Text style={styles.subscriptionSummaryText}>
            {activeCount} of {SEVERITY_SUBSCRIPTIONS.length} alerts are enabled
          </Text>
        </View>
      </View>

      <GlassView
        effect="regular"
        colorScheme={isDark ? 'dark' : 'light'}
        tintColor={glass.settingsCardTint}
        style={styles.subscriptionGlassCard}
        fallbackStyle={glass.fallback.settingsCard}
        showHighlight={false}
        pointerEvents="box-none"
      >
        {SEVERITY_SUBSCRIPTIONS.map((item, index) => {
          const theme = severityThemes[item.key];
          const isEnabled = preferences[item.key];

          return (
            <View key={item.key}>
              <View style={styles.subscriptionRow} pointerEvents="box-none">
                <View
                  style={[
                    styles.severityIconBox,
                    {
                      backgroundColor: theme.iconBg,
                      borderColor: theme.iconBorder,
                    },
                  ]}
                >
                  <Feather name={item.icon} size={wp(5.2)} color={theme.accent} />
                </View>

                <View style={styles.subscriptionTextBlock}>
                  <View style={styles.subscriptionHeaderRow}>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor: theme.badgeBg,
                          borderColor: theme.badgeBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.severityBadgeText, {color: theme.badgeText}]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                    <Text style={styles.subscriptionTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.subscriptionDesc}>{item.description}</Text>
                  <Text
                    style={[
                      styles.subscriptionStatus,
                      !isEnabled && styles.subscriptionStatusOff,
                    ]}
                  >
                    {isEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>

                <AnimatedToggle
                  value={isEnabled}
                  onValueChange={value => handleToggle(item.key, value)}
                  trackOnColor={colors.primary}
                  trackOffColor={colors.borderMuted}
                  thumbColor={colors.white}
                />
              </View>
              {index < SEVERITY_SUBSCRIPTIONS.length - 1 ? (
                <View style={styles.preferenceDivider} />
              ) : null}
            </View>
          );
        })}
      </GlassView>

      <View style={styles.saveButtonRow}>
        <Button
          title="Save Preferences"
          style={styles.savePreferencesButton}
          onPress={handleSave}
          disabled={!hasChanges}
        />
      </View>
    </SettingsScreenLayout>
  );
};

export default SubscriptionSettings;
