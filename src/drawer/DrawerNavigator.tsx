import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp, responsiveSize } from '../utils/responsive';
import CountiesScreen from '../screens/main/CountiesScreen';
import UsersScreen from '../screens/main/UsersScreen';
import KeywordsScreen from '../screens/main/KeywordsScreen';
import SendersScreen from '../screens/main/SendersScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import { fonts, images } from '../constants';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { userActions } from '../redux/slices/userSlice';
import { authActions } from '../redux/slices/authSlice';

const commonMenuItems = [
  { key: 'LiveFeed', label: 'Home', icon: images.home },
  { key: 'LeadLog', label: 'Lead Log', icon: images.users },
  { key: 'KeywordRequest', label: 'Keyword Request', icon: images.keyword },
  { key: 'Settings', label: 'Settings', icon: images.senders },
] as const;

const adminMenuItems = [
  { key: 'AdminConsole', label: 'Admin Console', icon: images.setting },
  { key: 'SystemStatus', label: 'System Status', icon: images.home },
  { key: 'Keywords', label: 'Keywords', icon: images.keyword },
  { key: 'Users', label: 'Users', icon: images.users },
] as const;

type MenuItem =
  | typeof commonMenuItems[number]['key']
  | typeof adminMenuItems[number]['key'];

const screenMap: Record<MenuItem, React.ComponentType<any>> = {
  LiveFeed: CountiesScreen,
  LeadLog: UsersScreen,
  KeywordRequest: KeywordsScreen,
  Settings: SettingsScreen,
  AdminConsole: DashboardScreen,
  SystemStatus: SendersScreen,
  Keywords: KeywordsScreen,
  Users: UsersScreen,
};

const DrawerNavigator = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const role = user.role || 'user';
  const email = user.email || 'user@firerelay.com';

  const currentMenuItems = role === 'admin' ? adminMenuItems : commonMenuItems;
  const [activeScreen, setActiveScreen] = useState<MenuItem>(role === 'admin' ? 'AdminConsole' : 'LiveFeed');

  useEffect(() => {
    setActiveScreen(role === 'admin' ? 'AdminConsole' : 'LiveFeed');
  }, [role]);

  // ── Notifications overlay ──────────────────────────────────────────────────
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifMounted, setNotifMounted] = useState(false);
  const notifSlide = useRef(new Animated.Value(1)).current; // 1 = off-screen right

  const openNotifications = () => {
    setNotifMounted(true);
    setShowNotifications(true);
    Animated.spring(notifSlide, {
      toValue: 0,
      friction: 9,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const closeNotifications = () => {
    setShowNotifications(false);
    Animated.timing(notifSlide, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start(() => setNotifMounted(false));
  };
  // ──────────────────────────────────────────────────────────────────────────

  const [isOpen, setIsOpen] = useState(false);
  const [shouldRenderDrawer, setShouldRenderDrawer] = useState(false);
  const drawerWidth = wp(76);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const drawerOpacity = useRef(new Animated.Value(0)).current;
  const drawerScale = useRef(new Animated.Value(0.96)).current;
  const itemAnimations = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isOpen ? 0 : -drawerWidth,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: isOpen ? 0.35 : 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(drawerOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(drawerScale, {
        toValue: isOpen ? 1 : 0.96,
        friction: 8,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !isOpen) {
        setShouldRenderDrawer(false);
        itemAnimations.forEach(animation => animation.setValue(0));
      }
    });
  }, [
    drawerOpacity,
    drawerScale,
    drawerWidth,
    isOpen,
    itemAnimations,
    overlayOpacity,
    translateX,
  ]);

  useEffect(() => {
    if (isOpen) {
      Animated.stagger(
        45,
        itemAnimations.map(animation =>
          Animated.spring(animation, {
            toValue: 1,
            friction: 8,
            tension: 80,
            useNativeDriver: true,
          }),
        ),
      ).start();
      return;
    }

    Animated.stagger(
      25,
      itemAnimations
        .slice()
        .reverse()
        .map(animation =>
          Animated.timing(animation, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
          }),
        ),
    ).start();
  }, [isOpen, itemAnimations]);

  const openDrawer = () => {
    setShouldRenderDrawer(true);
    setIsOpen(true);
  };
  const closeDrawer = () => setIsOpen(false);
  const selectScreen = (screen: MenuItem) => {
    setActiveScreen(screen);
    setIsOpen(false);
  };

  const ActiveScreen = screenMap[activeScreen];

  return (
    <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.screenContainer}>
        <ActiveScreen
          onOpenDrawer={openDrawer}
          onNotificationPress={openNotifications}
        />
      </View>

      {/* Notifications overlay */}
      {notifMounted && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              zIndex: 50,
              transform: [
                {
                  translateX: notifSlide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 500],
                  }),
                },
              ],
            },
          ]}
        >
          <NotificationsScreen onBack={closeNotifications} />
        </Animated.View>
      )}

      {shouldRenderDrawer && (
        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity> */}

      {shouldRenderDrawer && (
        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[
            styles.drawer,
            {
              opacity: drawerOpacity,
              transform: [{ translateX }, { scale: drawerScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['#05070A', '#0B1220', '#1A0F08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.drawerGradient}
          >
            <View style={styles.drawerProfile}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>{user.name ? user.name[0].toUpperCase() : 'U'}</Text>
              </View>
              <View style={styles.drawerProfileText}>
                <Text style={styles.drawerWelcomeText}>
                  Welcome back {user.name || 'Steve'}!
                </Text>
              </View>
            </View>

            {currentMenuItems.map((item, index) => {
              const isActive = item.key === activeScreen;
              const itemTranslateX = itemAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [-18, 0],
              });
              return (
                <Animated.View
                  key={item.key}
                  style={[
                    styles.drawerItemWrapper,
                    {
                      opacity: itemAnimations[index],
                      transform: [{ translateX: itemTranslateX }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => selectScreen(item.key)}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={['#2F5597', '#9B5427']}
                        locations={[0, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.drawerItem}
                      >
                        <Image
                          source={item.icon}
                          style={[styles.drawerItemIcon, styles.drawerItemIconActive]}
                          resizeMode="contain"
                        />
                        <Text style={[styles.drawerItemText, styles.drawerItemTextActive]}>
                          {item.label}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.drawerItem}>
                        <Image
                          source={item.icon}
                          style={styles.drawerItemIcon}
                          resizeMode="contain"
                        />
                        <Text style={styles.drawerItemText}>{item.label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {/* Log Out Button */}
            {(() => {
              const totalItems = currentMenuItems.length;
              return (
                <Animated.View
                  style={[
                    styles.drawerItemWrapper,
                    {
                      marginTop: 'auto',
                      marginBottom: 24,
                      opacity: itemAnimations[totalItems] || 1, // Fallback if out of bounds
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => {
                      dispatch(authActions.logout());
                      dispatch(userActions.clearUser());
                    }}
                  >
                    <View style={styles.drawerItem}>
                      <Image
                        source={images.setting}
                        style={[styles.drawerItemIcon, { tintColor: '#FF6B6B' }]}
                        resizeMode="contain"
                      />
                      <Text style={[styles.drawerItemText, { color: '#FF6B6B' }]}>Log Out</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })()}
          </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: hp(4),
    left: wp(4),
    width: wp(12),
    height: wp(12),
    borderRadius: wp(4),
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  menuIcon: {
    fontSize: responsiveSize(22),
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    zIndex: 90,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: wp(76),
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 100,
  },
  drawerGradient: {
    flex: 1,
    paddingTop: hp(6),
    paddingHorizontal: wp(4),
  },
  drawerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11151f',
    borderRadius: wp(5),
    padding: wp(4),
    marginBottom: hp(3),
  },
  drawerAvatar: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(4),
  },
  drawerAvatarText: {
    fontSize: responsiveSize(18),
    fontWeight: '700',
    color: '#fff',
  },
  drawerProfileText: {
    flex: 1,
  },
  drawerEmail: {
    fontSize: responsiveSize(16),
    fontWeight: '700',
    color: '#fff',
    marginBottom: hp(0.4),
  },
  drawerWelcomeText: {
    fontSize: responsiveSize(14),
    fontWeight: '500',
    color: '#38bdf8',
    marginBottom: hp(0.2),
  },
  sectionHeader: {
    fontSize: responsiveSize(14),
    fontWeight: '700',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: hp(2.5),
    marginBottom: hp(1.5),
    paddingHorizontal: wp(5),
  },
  drawerItemWrapper: {
    marginBottom: hp(1),
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11151f',
    borderRadius: wp(4),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
  },
  drawerItemIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: '#94a3b8',
  },
  drawerItemIconActive: {
    tintColor: '#fff',
  },
  drawerItemText: {
    marginLeft: wp(4),
    fontSize: responsiveSize(16),
    color: '#cbd5e1',
    fontFamily: fonts.medium,
  },
  drawerItemTextActive: {
    color: '#fff',
    fontFamily: fonts.semibold,
  },
});

export default DrawerNavigator;
