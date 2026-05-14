import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Header } from '../../../components';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { wp } from '../../../utils/responsive';

type Props = {
  navigation: any;
  onOpenDrawer?: () => void;
};

const SettingsMenu = ({ navigation, onOpenDrawer }: Props) => {
  return (
    <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Header
          title="Settings"
          onMenuPress={onOpenDrawer}
          showBack={false}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 14, alignSelf: 'flex-start', marginLeft: wp(4) }}>Manage your account settings and preferences</Text>
        <View style={styles.menuList}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <Text style={styles.menuItemText}>Profile</Text>
              <AntDesign name="right" size={18} color="#3b82f6" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('PasswordSettings')}
            >
              <Text style={styles.menuItemText}>Password</Text>
              <AntDesign name="right" size={18} color="#3b82f6" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SubscriptionSettings')}
            >
              <Text style={styles.menuItemText}>Subscriptions</Text>
              <AntDesign name="right" size={18} color="#3b82f6" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <TouchableOpacity style={styles.logoutButton} onPress={() => null}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SettingsMenu;
