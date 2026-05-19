import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { Header } from '../../../components';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, glass } from '../../../constants';

type Props = {
  navigation: any;
};

const SubscriptionSettings = ({ navigation }: Props) => {
  const [audioNotifications, setAudioNotifications] = useState(true);

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Header
          title="Subscription"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.contentContainer}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.sectionTitle}>Email Subscriptions</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <Text style={styles.sectionSubtitle}>Manage your email notification preferences</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
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
                trackColor={{ false: colors.borderMuted, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SubscriptionSettings;
