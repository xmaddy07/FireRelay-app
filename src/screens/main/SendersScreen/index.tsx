import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Header} from '../../../components';
import {useOpenNotifications} from '../../../navigation/hooks';
import {createStyles} from './styles';
import {useTheme, useThemedStyles} from '../../../theme';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onOpenDrawer?: () => void;
};

const SendersScreen = ({onOpenDrawer}: Props) => {
  const openNotifications = useOpenNotifications();
  const {glass} = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Header
          title="Senders"
          subtitle="View active audio senders and relay targets."
          onMenuPress={onOpenDrawer}
          showNotification
          onNotificationPress={openNotifications}
        />
        <Text style={styles.subtitle}>View active audio senders and relay targets.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sender status</Text>
          <Text style={styles.cardText}>No senders connected yet.</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SendersScreen;
