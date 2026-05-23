import React, {useCallback, useState} from 'react';
import {View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../../../components';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../config/theme';
import SettingsScreenLayout from './SettingsScreenLayout';
import AnimatedToggle from './components/AnimatedToggle';

type SeverityKey = 'critical' | 'high' | 'medium' | 'low';

type SeveritySubscription = {
  key: SeverityKey;
  badge: string;
  title: string;
  description: string;
  badgeStyle: 'severityBadgeCritical' | 'severityBadgeHigh' | 'severityBadgeMedium' | 'severityBadgeLow';
  badgeTextStyle:
    | 'severityBadgeTextCritical'
    | 'severityBadgeTextHigh'
    | 'severityBadgeTextMedium'
    | 'severityBadgeTextLow';
};

const SEVERITY_SUBSCRIPTIONS: SeveritySubscription[] = [
  {
    key: 'critical',
    badge: 'Critical',
    title: 'Critical alerts',
    description: 'Email notifications for critical keyword matches.',
    badgeStyle: 'severityBadgeCritical',
    badgeTextStyle: 'severityBadgeTextCritical',
  },
  {
    key: 'high',
    badge: 'High',
    title: 'High alerts',
    description: 'Email notifications for high-priority keyword matches.',
    badgeStyle: 'severityBadgeHigh',
    badgeTextStyle: 'severityBadgeTextHigh',
  },
  {
    key: 'medium',
    badge: 'Medium',
    title: 'Medium alerts',
    description: 'Email notifications for medium-priority keyword matches.',
    badgeStyle: 'severityBadgeMedium',
    badgeTextStyle: 'severityBadgeTextMedium',
  },
  {
    key: 'low',
    badge: 'Low',
    title: 'Low alerts',
    description: 'Email notifications for low-priority keyword matches.',
    badgeStyle: 'severityBadgeLow',
    badgeTextStyle: 'severityBadgeTextLow',
  },
];

const defaultPreferences: Record<SeverityKey, boolean> = {
  critical: true,
  high: true,
  medium: true,
  low: true,
};

const SubscriptionSettings = () => {
  const navigation = useNavigation();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [savedPreferences, setSavedPreferences] = useState(defaultPreferences);

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
      title="Subscription"
      showBack
      onBackPress={() => navigation.goBack()}
    >
      <Text style={styles.sectionTitle}>Email Subscriptions</Text>
      <Text style={styles.sectionSubtitle}>
        Choose which keyword severity levels trigger email alerts.
      </Text>

      <View style={styles.subscriptionList}>
        {SEVERITY_SUBSCRIPTIONS.map(item => (
          <View key={item.key} style={styles.subscriptionCard}>
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeaderRow}>
                <View style={[styles.severityBadge, styles[item.badgeStyle]]}>
                  <Text
                    style={[styles.severityBadgeText, styles[item.badgeTextStyle]]}
                  >
                    {item.badge}
                  </Text>
                </View>
                <Text style={styles.subscriptionTitle}>{item.title}</Text>
              </View>
              <Text style={styles.subscriptionDesc}>{item.description}</Text>
            </View>
            <AnimatedToggle
              value={preferences[item.key]}
              onValueChange={value => handleToggle(item.key, value)}
              trackOnColor={colors.primary}
              trackOffColor={colors.borderMuted}
              thumbColor={colors.white}
            />
          </View>
        ))}
      </View>

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
