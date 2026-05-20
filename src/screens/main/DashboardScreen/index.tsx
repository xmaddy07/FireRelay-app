import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Button, Header} from '../../../components';
import {createStyles} from './styles';
import {useThemedStyles} from '../../../theme';

type Props = {
  onOpenDrawer?: () => void;
  onNotificationPress?: () => void;
};

const DashboardScreen = ({onOpenDrawer, onNotificationPress}: Props) => {
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="Dashboard"
        subtitle="Your relay sessions at a glance."
        onMenuPress={onOpenDrawer}
        showNotification={!!onNotificationPress}
        onNotificationPress={onNotificationPress}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active relay</Text>
        <Text style={styles.sectionText}>No active sessions right now.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Button title="Start relay" onPress={() => null} />
        <Button title="Join relay" onPress={() => null} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent relays</Text>
        <Text style={styles.sectionText}>You haven't joined a relay yet.</Text>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;
