import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, Text, ActivityIndicator, Alert, InteractionManager} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {Button} from '../../../components';
import {GlassView} from '../../../components/feed/LiquidGlass';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {wp} from '../../../utils/responsive';
import SettingsScreenLayout from './SettingsScreenLayout';
import AnimatedToggle from './components/AnimatedToggle';
import {
  ApiError,
  getProfile,
  updateProfile,
  type AuthUser,
  type KeywordSeverity,
  DEFAULT_NOTIFICATION_PREFERENCES,
  KEYWORD_SEVERITY_LEVELS,
  severityDisplayName,
  type NotificationPreferences,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';

type SubscriptionSeverity = Exclude<KeywordSeverity, 'CRITICAL'>;

type SeverityIcon = 'alert-triangle' | 'alert-circle' | 'bell';

type SeverityTheme = {
  accent: string;
  iconBg: string;
  iconBorder: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
};

type SeveritySubscription = {
  key: SubscriptionSeverity;
  title: string;
  description: string;
  icon: SeverityIcon;
};

const SUBSCRIPTION_LEVELS: SubscriptionSeverity[] = ['HIGH', 'MEDIUM', 'LOW'];

const SEVERITY_SUBSCRIPTIONS: SeveritySubscription[] = [
  {
    key: 'HIGH',
    title: 'High alerts',
    description: 'Email notifications for high-priority keyword matches.',
    icon: 'alert-triangle',
  },
  {
    key: 'MEDIUM',
    title: 'Medium alerts',
    description: 'Email notifications for medium-priority keyword matches.',
    icon: 'alert-circle',
  },
  {
    key: 'LOW',
    title: 'Low alerts',
    description: 'Email notifications for low-priority keyword matches.',
    icon: 'bell',
  },
];

const defaultPreferences = (): Record<KeywordSeverity, boolean> =>
  Object.fromEntries(
    KEYWORD_SEVERITY_LEVELS.map(level => [
      level,
      DEFAULT_NOTIFICATION_PREFERENCES[level].email,
    ]),
  ) as Record<KeywordSeverity, boolean>;

const parseNotificationPreferences = (
  profile: AuthUser,
): Record<KeywordSeverity, boolean> => {
  const prefs = profile.notificationPreferences;
  const defaults = defaultPreferences();

  if (!prefs || typeof prefs !== 'object') {
    return defaults;
  }

  return Object.fromEntries(
    KEYWORD_SEVERITY_LEVELS.map(level => {
      const entry = prefs[level];
      return [
        level,
        typeof entry?.email === 'boolean' ? entry.email : defaults[level],
      ];
    }),
  ) as Record<KeywordSeverity, boolean>;
};

const toApiPayload = (
  preferences: Record<KeywordSeverity, boolean>,
): NotificationPreferences =>
  Object.fromEntries(
    KEYWORD_SEVERITY_LEVELS.map(level => [
      level,
      {email: preferences[level]},
    ]),
  ) as NotificationPreferences;

const getSeverityThemes = (
  isDark: boolean,
): Record<SubscriptionSeverity, SeverityTheme> => ({
  HIGH: {
    accent: '#FB923C',
    iconBg: isDark ? 'rgba(249, 115, 22, 0.16)' : 'rgba(249, 115, 22, 0.12)',
    iconBorder: isDark ? 'rgba(249, 115, 22, 0.34)' : 'rgba(249, 115, 22, 0.24)',
    badgeBg: isDark ? 'rgba(249, 115, 22, 0.18)' : 'rgba(249, 115, 22, 0.12)',
    badgeBorder: isDark ? 'rgba(249, 115, 22, 0.32)' : 'rgba(249, 115, 22, 0.2)',
    badgeText: isDark ? '#FDBA74' : '#C2410C',
  },
  MEDIUM: {
    accent: '#FACC15',
    iconBg: isDark ? 'rgba(234, 179, 8, 0.16)' : 'rgba(234, 179, 8, 0.14)',
    iconBorder: isDark ? 'rgba(234, 179, 8, 0.34)' : 'rgba(234, 179, 8, 0.24)',
    badgeBg: isDark ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.14)',
    badgeBorder: isDark ? 'rgba(234, 179, 8, 0.32)' : 'rgba(234, 179, 8, 0.22)',
    badgeText: isDark ? '#FDE047' : '#A16207',
  },
  LOW: {
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
  const {token} = useAuth();
  const {colors, glass, isDark} = useTheme();
  const styles = useThemedStyles(createStyles);
  const severityThemes = useMemo(() => getSeverityThemes(isDark), [isDark]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [savedPreferences, setSavedPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const profile = await getProfile(token);
      const parsed = parseNotificationPreferences(profile);
      setPreferences(parsed);
      setSavedPreferences(parsed);
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert('Unable to load preferences', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadPreferences();
    });
    return () => task.cancel();
  }, [loadPreferences]);

  const activeCount = SEVERITY_SUBSCRIPTIONS.filter(
    item => preferences[item.key],
  ).length;

  const handleToggle = useCallback(
    (key: SubscriptionSeverity, value: boolean) => {
      setPreferences(prev => ({...prev, [key]: value}));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!token) {
      Alert.alert('Sign in required', 'You must be signed in to save preferences.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(token, {
        notificationPreferences: toApiPayload(preferences),
      });
      setSavedPreferences(preferences);
      Alert.alert('Preferences saved', 'Your email alert preferences have been updated.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to save preferences.';
      Alert.alert('Save failed', message);
    } finally {
      setSaving(false);
    }
  }, [preferences, token]);

  const hasChanges = SUBSCRIPTION_LEVELS.some(
    level => preferences[level] !== savedPreferences[level],
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
          Choose which keyword severity levels trigger email alerts.
        </Text>
        <View style={styles.subscriptionSummaryChip}>
          <View style={styles.subscriptionSummaryDot} />
          <Text style={styles.subscriptionSummaryText}>
            {activeCount} of {SEVERITY_SUBSCRIPTIONS.length} alerts are enabled
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{marginVertical: wp(8)}} />
      ) : (
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
                          {severityDisplayName(item.key)}
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
                      Email {isEnabled ? 'ON' : 'OFF'}
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
      )}

      <View style={styles.saveButtonRow}>
        <Button
          title={saving ? 'Saving...' : 'Save Preferences'}
          style={styles.savePreferencesButton}
          onPress={handleSave}
          disabled={!hasChanges || saving || loading}
        />
      </View>
    </SettingsScreenLayout>
  );
};

export default SubscriptionSettings;
