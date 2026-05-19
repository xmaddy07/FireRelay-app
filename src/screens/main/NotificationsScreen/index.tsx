import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../../components/Header';
import { GlassView } from '../../../components/LiquidGlass';
import { glass } from '../../../constants/glass';
import { hp, wp, responsiveSize } from '../../../utils/responsive';
import { colors, images } from '../../../constants';

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifSeverity = 'structure_fire' | 'bell' | 'alert' | 'info';

type NotifItem = {
  id: string;
  severity: NotifSeverity;
  county: string;
  talkgroup: string;
  timeAgo: string;
  message: string;
  read: boolean;
};

// ─── Mock Data (matches the screenshot) ──────────────────────────────────────

const mockNotifications: NotifItem[] = [
  {
    id: 'n1',
    severity: 'structure_fire',
    county: 'Structure Fire (Unconfirmed)',
    talkgroup: '',
    timeAgo: '11m ago',
    message: '401 Southwest H K Dodgen Loop, Temple, Texas 76502',
    read: false,
  },
  {
    id: 'n2',
    severity: 'bell',
    county: 'Bell',
    talkgroup: 'structure fire',
    timeAgo: '18m ago',
    message:
      'Engine 4. Structure fire. Normal engine will apply as compared to your electrical power. Floor 1, Southwest HK, downwind. D-134, bearing and apartments. Engine 4. 237.',
    read: false,
  },
  {
    id: 'n3',
    severity: 'alert',
    county: 'Williamson',
    talkgroup: 'nothing showing',
    timeAgo: '28m ago',
    message:
      'Very affordable building, nothing showing from the exterior. Engine 3 will be out investing. Show Engine 3 the same command.',
    read: false,
  },
  {
    id: 'n4',
    severity: 'alert',
    county: 'Williamson',
    talkgroup: 'commercial fire ala...',
    timeAgo: '36m ago',
    message:
      'Taylor engine 3 respond priority 1 for commercial fire alarm samsung plant 1530 fm 973 cross street buttercup road and county road 404 Taylor box number 4 2 3 6 respond o...',
    read: true,
  },
  {
    id: 'n5',
    severity: 'alert',
    county: 'Williamson',
    talkgroup: 'commercial fire ala...',
    timeAgo: '36m ago',
    message:
      'Taylor engine 3 respond priority 1 for commercial fire alarm Samsung plant 1530 FN 973 Cross Street, Buttercup road in town',
    read: true,
  },
  {
    id: 'n6',
    severity: 'alert',
    county: 'Travis',
    talkgroup: 'nothing showing,comm...',
    timeAgo: '46m ago',
    message:
      "We have a large commercial, single story commercial structure. Nothing showing, we do have an active alarm. We'll be asking.",
    read: true,
  },
  {
    id: 'n7',
    severity: 'bell',
    county: 'McLennan',
    talkgroup: 'structure fire',
    timeAgo: '1h ago',
    message:
      'Engine 3 responding to a reported structure fire at 815 N 25th Street. Smoke visible from A side.',
    read: true,
  },
  {
    id: 'n8',
    severity: 'info',
    county: 'Travis',
    talkgroup: 'medical response',
    timeAgo: '1h 20m ago',
    message:
      "Medic 7 on scene of a priority 2 medical, patient is conscious and breathing. Transporting to St. David's.",
    read: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getSeverityEmoji = (severity: NotifSeverity) => {
  switch (severity) {
    case 'structure_fire':
      return '🔔';
    case 'bell':
      return '🔥';
    case 'alert':
      return '🚨';
    case 'info':
    default:
      return '📢';
  }
};

const buildTitle = (item: NotifItem) => {
  if (item.talkgroup) {
    return `${item.county}: [${item.talkgroup}]`;
  }
  return item.county;
};

// ─── Notification Item Component ──────────────────────────────────────────────

type ItemProps = {
  item: NotifItem;
  index: number;
  entranceAnim: Animated.Value;
  onPress: (id: string) => void;
};

const NotificationItem = ({ item, entranceAnim, onPress }: ItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const slideStyle = {
    opacity: entranceAnim,
    transform: [
      {
        translateY: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
      { scale },
    ],
  };

  return (
    <Animated.View style={slideStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <GlassView
          interactive
          effect="regular"
          colorScheme="dark"
          tintColor={item.read ? glass.cardReadTint : glass.cardUnreadTint}
          style={[
            styles.card,
            item.read ? styles.cardRead : styles.cardUnread,
          ]}
          fallbackStyle={
            item.read
              ? glass.fallback.cardRead
              : glass.fallback.cardUnread
          }
        >
          {!item.read && <View style={styles.unreadStrip} />}

          <View style={styles.cardInner}>
            <View style={[styles.iconWrapper, item.read && styles.iconWrapperRead]}>
              <Image
                source={images.notification}
                style={styles.iconImage}
                resizeMode="contain"
              />
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              {/* Title row */}
              <View style={styles.titleRow}>
                <Text style={styles.titleText} numberOfLines={1}>
                  <Text style={styles.emoji}>{getSeverityEmoji(item.severity)} </Text>
                  <Text style={item.read ? styles.titleRead : styles.titleUnread}>
                    {buildTitle(item)}
                  </Text>
                </Text>
                <Text style={styles.timeText}>{item.timeAgo}</Text>
              </View>

              {/* Message */}
              <Text
                style={[styles.messageText, item.read && styles.messageRead]}
                numberOfLines={3}
              >
                {item.message}
              </Text>
            </View>
          </View>
        </GlassView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

type Props = {
  onOpenDrawer?: () => void;
  onBack?: () => void;
};

const NotificationsScreen = ({ onOpenDrawer, onBack }: Props) => {
  const [notifications, setNotifications] = useState<NotifItem[]>(mockNotifications);

  // Staggered entrance animations per item
  const itemAnims = useRef(
    mockNotifications.map(() => new Animated.Value(0)),
  ).current;

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.stagger(
        70,
        itemAnims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
        ),
      ),
    ]).start();
  }, []);

  const handlePress = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderHeader = () => (
    <Animated.View style={{ opacity: headerAnim }}>
      <View style={styles.listHeader}>
        <View style={styles.listHeaderLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.listHeaderTitle}>Recent Alerts</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount} NEW</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={{ opacity: headerAnim }}>
        <Header
          title="Notifications"
          onMenuPress={onOpenDrawer}
          showBack={!!onBack}
          onBackPress={onBack}
          showNotification={false}
        />
      </Animated.View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <NotificationItem
            item={item}
            index={index}
            entranceAnim={itemAnims[index] ?? new Animated.Value(1)}
            onPress={handlePress}
          />
        )}
      />
    </LinearGradient>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(5),
  },

  // List header
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulseDot: {
    width: wp(2.4),
    height: wp(2.4),
    borderRadius: wp(999),
    backgroundColor: colors.primary,
    marginRight: wp(2),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  listHeaderTitle: {
    fontSize: responsiveSize(20),
    fontWeight: '800',
    color: '#f8fafc',
  },
  unreadBadge: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderRadius: wp(6),
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  unreadBadgeText: {
    fontSize: responsiveSize(10.5),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.6,
  },

  // Card
  card: {
    borderRadius: wp(4),
    marginBottom: hp(1.4),
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  cardUnread: {
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cardRead: {
    borderColor: 'rgba(255,255,255,0.06)',
  },
  unreadStrip: {
    width: wp(1),
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  cardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: hp(1.6),
    paddingHorizontal: wp(3.5),
  },

  // Icon
  iconWrapper: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(3),
    backgroundColor: '#1d2c45',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
    marginTop: hp(0.3),
  },
  iconWrapperRead: {
    backgroundColor: '#131c2c',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconImage: {
    width: wp(5.5),
    height: wp(5.5),
    tintColor: colors.primary,
  },

  // Content
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: hp(0.6),
  },
  titleText: {
    flex: 1,
    paddingRight: wp(2),
  },
  emoji: {
    fontSize: responsiveSize(13),
  },
  titleUnread: {
    fontSize: responsiveSize(13.5),
    fontWeight: '800',
    color: '#f1f5f9',
  },
  titleRead: {
    fontSize: responsiveSize(13.5),
    fontWeight: '700',
    color: '#94a3b8',
  },
  timeText: {
    fontSize: responsiveSize(11),
    color: '#64748b',
    fontWeight: '500',
    flexShrink: 0,
    marginTop: hp(0.15),
  },
  messageText: {
    fontSize: responsiveSize(12.5),
    color: '#cbd5e1',
    lineHeight: responsiveSize(18),
  },
  messageRead: {
    color: '#64748b',
  },
});

export default NotificationsScreen;
