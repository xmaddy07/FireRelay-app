import React from 'react';
import {View, Text, ScrollView, ImageBackground} from 'react-native';
import {styles} from './styles';
import { Header } from '../../../components';
import {images} from '../../../constants';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onOpenDrawer?: () => void;
};

const CountiesScreen = ({onOpenDrawer}: Props) => (
 <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
    <ScrollView contentContainerStyle={styles.content}>
      <Header
        title="Counties"
        subtitle="Browse relay regions and local groups."
        onMenuPress={onOpenDrawer}
      />
      <Text style={styles.subtitle}>Browse relay regions and local groups.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Central Relay</Text>
        <Text style={styles.cardText}>24 active users, 8 live sessions.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>East Ridge</Text>
        <Text style={styles.cardText}>12 active users, 3 live sessions.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>West Harbor</Text>
        <Text style={styles.cardText}>18 active users, 5 live sessions.</Text>
      </View>
    </ScrollView>
    </LinearGradient>
);

export default CountiesScreen;
