import React from 'react';
import {View, Text} from 'react-native';
import {Button, Header} from '../../../components';
import {styles} from './styles';

type Props = {
  onOpenDrawer?: () => void;
};

const RelaySessionScreen = ({onOpenDrawer}: Props) => (
  <View style={styles.container}>
    <Header
      title="Relay Session"
      subtitle="Live session status and connected users."
      onMenuPress={onOpenDrawer}
    />
    <View style={styles.sessionInfo}>
      <Text style={styles.infoLabel}>Connected users</Text>
      <Text style={styles.infoText}>5 participants</Text>
      <Text style={styles.infoLabel}>Session timer</Text>
      <Text style={styles.infoText}>00:12:34</Text>
    </View>
    <View style={styles.footer}>
      <Button title="Mute audio" onPress={() => null} />
      <Button title="Leave session" onPress={() => null} />
    </View>
  </View>
);

export default RelaySessionScreen;
