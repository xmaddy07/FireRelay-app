import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Button, Header} from '../../../components';
import {styles} from './styles';

type Props = {
  onOpenDrawer?: () => void;
};

const DashboardScreen = ({onOpenDrawer}: Props) => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Header
      title="Dashboard"
      subtitle="Your relay sessions at a glance."
      onMenuPress={onOpenDrawer}
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
      <Text style={styles.sectionText}>You haven’t joined a relay yet.</Text>
    </View>
  </ScrollView>
);

export default DashboardScreen;
