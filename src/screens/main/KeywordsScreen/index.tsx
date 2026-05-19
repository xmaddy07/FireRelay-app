import React from 'react';
import {View, Text, ScrollView, ImageBackground} from 'react-native';
import {Header} from '../../../components';
import {glass, images} from '../../../constants';
import {styles} from './styles';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onNotificationPress?: () => void;
};

const KeywordsScreen = ({onNotificationPress}: Props) => (
 <LinearGradient
      colors={[...glass.screenGradient]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
    <ScrollView contentContainerStyle={styles.content}>
      <Header
        title="Keywords"
        subtitle="Track and organize relay topics."
        onNotificationPress={onNotificationPress}
        showNotification={true}
      />
      <Text style={styles.subtitle}>Track and organize relay topics.</Text>
      <View style={styles.chipRow}>
        <View style={styles.chip}><Text style={styles.chipText}>Fire Safety</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>First Aid</Text></View>
      </View>
      <View style={styles.chipRow}>
        <View style={styles.chip}><Text style={styles.chipText}>Evacuation</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>Communication</Text></View>
      </View>
      <View style={styles.chipRow}>
        <View style={styles.chip}><Text style={styles.chipText}>Teamwork</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>Alerts</Text></View>
      </View>
    </ScrollView>
  </LinearGradient>
);

export default KeywordsScreen;
