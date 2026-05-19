import React from 'react';
import {View, Text, ScrollView, ImageBackground} from 'react-native';
import {Header} from '../../../components';
import {glass, images} from '../../../constants';
import {styles} from './styles';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onOpenDrawer?: () => void;
};

const SendersScreen = ({onOpenDrawer}: Props) => (
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
      />
      <Text style={styles.subtitle}>View active audio senders and relay targets.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Radio Team</Text>
        <Text style={styles.cardText}>Streaming to 5 stations.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Field Operators</Text>
        <Text style={styles.cardText}>Ready to dispatch messages.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Support Node</Text>
        <Text style={styles.cardText}>Listening for priority alerts.</Text>
      </View>
    </ScrollView>
  </LinearGradient>
);

export default SendersScreen;
