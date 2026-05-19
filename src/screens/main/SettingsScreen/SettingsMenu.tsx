import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Header } from '../../../components';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, glass, images } from '../../../constants';
import { wp } from '../../../utils/responsive';
import { useAppDispatch } from '../../../redux/hooks';
import { authActions } from '../../../redux/slices/authSlice';
import { userActions } from '../../../redux/slices/userSlice';

type Props = {
  navigation: any;
  onNotificationPress?: () => void;
};

const SettingsMenu = ({ navigation, onNotificationPress }: Props) => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(authActions.logout());
    dispatch(userActions.clearUser());
  };
  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Header
          title="Settings"
          showBack={false}
          onNotificationPress={onNotificationPress}
          showNotification={true}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={{ color: colors.text, textAlign: "center", fontSize: 14, alignSelf: 'flex-start', marginLeft: wp(4) }}>Manage your account settings and preferences</Text>
        <View style={styles.menuList}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProfileSettings')}
            >
              <Text style={styles.menuItemText}>Profile</Text>
              <AntDesign name="right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('PasswordSettings')}
            >
              <Text style={styles.menuItemText}>Password</Text>
              <AntDesign name="right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SubscriptionSettings')}
            >
              <Text style={styles.menuItemText}>Subscriptions</Text>
              <AntDesign name="right" size={18} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout} activeOpacity={0.82}>
              <Image
                source={images.setting}
                style={styles.logoutIcon}
                resizeMode="contain"
              />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SettingsMenu;
