import React from 'react';
import {View, Text, ScrollView, ImageBackground} from 'react-native';
import {Header} from '../../../components';
import {images} from '../../../constants';
import {styles} from './styles';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onOpenDrawer?: () => void;
};

const UsersScreen = ({onOpenDrawer}: Props) => (
 <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
    <ScrollView contentContainerStyle={styles.content}>
      <Header
        title="Users"
        subtitle="Manage your FireRelay community members."
        onMenuPress={onOpenDrawer}
      />
      <Text style={styles.subtitle}>Manage your FireRelay community members.</Text>
      <View style={styles.item}>
        <View style={styles.badge}><Text style={styles.badgeText}>A</Text></View>
        <View style={styles.itemText}>
          <Text style={styles.itemName}>Alex Morgan</Text>
          <Text style={styles.itemRole}>Host</Text>
        </View>
      </View>
      <View style={styles.item}>
        <View style={styles.badge}><Text style={styles.badgeText}>J</Text></View>
        <View style={styles.itemText}>
          <Text style={styles.itemName}>Jamie Roy</Text>
          <Text style={styles.itemRole}>Speaker</Text>
        </View>
      </View>
      <View style={styles.item}>
        <View style={styles.badge}><Text style={styles.badgeText}>M</Text></View>
        <View style={styles.itemText}>
          <Text style={styles.itemName}>Mia Chen</Text>
          <Text style={styles.itemRole}>Listener</Text>
        </View>
      </View>
    </ScrollView>
  </LinearGradient>
);

export default UsersScreen;
