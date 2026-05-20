import React, {useState} from 'react';
import {View, Text, Switch} from 'react-native';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../theme';
import SettingsScreenLayout from './SettingsScreenLayout';

type Props = {
  onBack: () => void;
};

const SubscriptionSettings = ({onBack}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [audioNotifications, setAudioNotifications] = useState(true);

  return (
    <SettingsScreenLayout
      title="Subscription"
      showBack
      onBackPress={onBack}
      fullScreen
    >
      <Text style={styles.sectionTitle}>Email Subscriptions</Text>
      <Text style={styles.sectionSubtitle}>
        Manage your email notification preferences
      </Text>

      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionContent}>
          <Text style={styles.subscriptionTitle}>Audio Notifications</Text>
          <Text style={styles.subscriptionDesc}>
            Receive email alerts for new audio notifications
          </Text>
        </View>
        <Switch
          value={audioNotifications}
          onValueChange={setAudioNotifications}
          trackColor={{false: colors.borderMuted, true: colors.primary}}
          thumbColor={colors.white}
        />
      </View>
    </SettingsScreenLayout>
  );
};

export default SubscriptionSettings;
