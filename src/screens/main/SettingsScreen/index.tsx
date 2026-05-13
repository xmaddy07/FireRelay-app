import React from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {Header} from '../../../components';
import {images} from '../../../constants';
import {styles} from './styles';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onOpenDrawer?: () => void;
};

const SettingsScreen = ({onOpenDrawer}: Props) => (
  <LinearGradient
       colors={['#05070A', '#0B1220', '#1A0F08']}
       start={{x: 0, y: 0}}
       end={{x: 1, y: 1}}
       style={styles.container}
     >
    <Header
      title="Settings"
      subtitle="Customize your FireRelay experience."
      onMenuPress={onOpenDrawer}
    />
    <Text style={styles.subtitle}>Customize your FireRelay experience.</Text>

    <TouchableOpacity style={styles.option} onPress={() => null}>
      <Text style={styles.optionText}>Privacy</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.option} onPress={() => null}>
      <Text style={styles.optionText}>Security</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.option} onPress={() => null}>
      <Text style={styles.optionText}>Notifications</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.option} onPress={() => null}>
      <Text style={styles.optionText}>Help Center</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.option} onPress={() => null}>
      <Text style={[styles.optionText, styles.logout]}>Logout</Text>
    </TouchableOpacity>
  </LinearGradient>
);

export default SettingsScreen;
