import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button, Header } from '../../../components';
import { styles } from './styles';

type Props = {
  onOpenDrawer?: () => void;
};

const ProfileScreen = ({ onOpenDrawer }: Props) => (
  <View style={styles.container}>
    <Header
      title="Profile"
      subtitle="Manage your account details."
      onMenuPress={onOpenDrawer}
    />
    <View style={styles.profileCard}>
      <Image style={styles.avatar} source={{ uri: 'https://via.placeholder.com/100' }} />
      <Text style={styles.name}>FireRelay User</Text>
      <Text style={styles.email}>user@example.com</Text>
    </View>
    <Button title="Account settings" onPress={() => null} />
  </View>
);

export default ProfileScreen;
