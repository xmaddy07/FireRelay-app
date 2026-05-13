import React from 'react';
import {View, Text} from 'react-native';
import {Button, Header} from '../../../components';
import {styles} from './styles';

type Props = {
  onOpenDrawer?: () => void;
};

const AudioPlayerScreen = ({onOpenDrawer}: Props) => (
  <View style={styles.container}>
    <Header
      title="Audio Player"
      subtitle="Play, record, and send relay audio."
      onMenuPress={onOpenDrawer}
    />
    <View style={styles.statusCard}>
      <Text style={styles.statusLabel}>Recording</Text>
      <Text style={styles.statusText}>00:02:15</Text>
    </View>
    <View style={styles.controls}>
      <Button title="Play" onPress={() => null} />
      <Button title="Pause" onPress={() => null} />
      <Button title="Stop" onPress={() => null} />
      <Button title="Send audio" onPress={() => null} />
    </View>
  </View>
);

export default AudioPlayerScreen;
