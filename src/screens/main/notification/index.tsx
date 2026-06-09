import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Header} from '../../../components';
import {GlassView} from '../../../components/feed/LiquidGlass';
import {hp, wp, responsiveSize} from '../../../utils/responsive';
import {fonts, images} from '../../../config/constants';
import type {AppColors} from '../../../config/theme/types';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {useAuth} from '../../../hooks/useAuth';
import {useOpenFeedAudio} from '../../../navigation/hooks';
import {
  ApiError,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRecord,
} from '../../../api';
import {type NotifSeverity} from '../../../api/mappers/notificationMapper';
import {useNotificationTimestamps} from '../../../hooks/useNotificationTimestamps';
import {
  formatNotificationTime,
  getNotificationDisplayTimestamp,
  sortNotificationsUnreadFirst,
} from '../../../utils/notificationTime';

const PAGE_SIZE = 20;

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

const buildTitle = (item: NotificationRecord) => {
  if (item.talkgroup) {
    return `${item.county}: [${item.talkgroup}]`;
  }
  return item.county;
};

// ─── Notification Item Component ──────────────────────────────────────────────

type ItemProps = {
  item: NotificationRecord;
  entranceAnim: Animated.Value;
  audioTimestamps: ReadonlyMap<string, string>;
  resolvedAudioIds: ReadonlySet<string>;
  onPress: (id: string) => void;
};

const NotificationItem = ({
  item,
  entranceAnim,
  audioTimestamps,
  resolvedAudioIds,
  onPress,
}: ItemProps) => {
  const {glass, isDark} = useTheme();
  const styles = useThemedStyles(createNotificationStyles);
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
      {scale},
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
          colorScheme={isDark ? 'dark' : 'light'}
          tintColor={item.read ? glass.cardReadTint : glass.cardUnreadTint}
          style={[
            styles.card,
            item.read ? styles.cardRead : styles.cardUnread,
          ]}
          fallbackStyle={
            item.read ? glass.fallback.cardRead : glass.fallback.cardUnread
          }
        >
          <View style={styles.cardRow}>
            {!item.read && <View style={styles.unreadStrip} />}

            <View style={styles.cardInner}>
              <View
                style={[styles.iconWrapper, item.read && styles.iconWrapperRead]}
              >
                <Image
                  source={images.notification}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.titleText,
                      item.read ? styles.titleRead : styles.titleUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {`${getSeverityEmoji(item.severity)} ${buildTitle(item)}`}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatNotificationTime(
                      getNotificationDisplayTimestamp(
                        item,
                        audioTimestamps,
                        resolvedAudioIds,
                      ),
                    )}
                  </Text>
                </View>

                <Text
                  style={[styles.messageText, item.read && styles.messageRead]}
                  numberOfLines={3}
                >
                  {item.message || '—'}
                </Text>
              </View>
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

const NotificationsScreen = ({onOpenDrawer, onBack}: Props) => {
  const {glass, colors} = useTheme();
  const styles = useThemedStyles(createNotificationStyles);
  const {token} = useAuth();
  const openFeedAudio = useOpenFeedAudio();

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const {
    audioTimestamps,
    resolvedAudioIds,
    audioTimestampsVersion,
    relativeTimeTick,
    ensureTimestampsHydrated,
  } = useNotificationTimestamps(token);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const itemAnimsRef = useRef<Record<string, Animated.Value>>({});
  const animatedIdsRef = useRef<Set<string>>(new Set());

  const getItemAnim = useCallback((id: string) => {
    if (!itemAnimsRef.current[id]) {
      itemAnimsRef.current[id] = new Animated.Value(0);
    }
    return itemAnimsRef.current[id];
  }, []);

  const animateNewItems = useCallback(
    (items: NotificationRecord[]) => {
      const newItems = items.filter(item => !animatedIdsRef.current.has(item.id));
      if (newItems.length === 0) {
        return;
      }

      const anims = newItems.map(item => {
        animatedIdsRef.current.add(item.id);
        const anim = getItemAnim(item.id);
        anim.setValue(0);
        return anim;
      });

      Animated.stagger(
        70,
        anims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
        ),
      ).start();
    },
    [getItemAnim],
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await getUnreadNotificationCount(token);
      setUnreadCount(count);
    } catch {
      // Keep the last known count when the badge endpoint fails.
    }
  }, [token]);

  const loadNotifications = useCallback(
    async (pageToLoad: number, append: boolean, isRefresh = false) => {
      if (!token) {
        setLoading(false);
        setLoadError('Please sign in to view notifications.');
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else if (!isRefresh) {
        setLoading(true);
      }
      setLoadError(null);

      try {
        const result = await listNotifications(token, {
          page: pageToLoad,
          limit: PAGE_SIZE,
        });

        if (!append) {
          animatedIdsRef.current.clear();
        }

        await ensureTimestampsHydrated(result.items);

        setNotifications(prev => {
          const merged = append
            ? (() => {
                const existingIds = new Set(prev.map(item => item.id));
                return [
                  ...prev,
                  ...result.items.filter(item => !existingIds.has(item.id)),
                ];
              })()
            : result.items;

          animateNewItems(
            append
              ? result.items.filter(
                  item => !prev.some(existing => existing.id === item.id),
                )
              : result.items,
          );

          return sortNotificationsUnreadFirst(
            merged,
            audioTimestamps,
            resolvedAudioIds,
          );
        });
        setPage(pageToLoad);
        setHasMore(result.hasMore);
        void fetchUnreadCount();
      } catch (error) {
        if (!append) {
          setNotifications([]);
        }
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load notifications.',
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [
      animateNewItems,
      audioTimestamps,
      ensureTimestampsHydrated,
      fetchUnreadCount,
      resolvedAudioIds,
      token,
    ],
  );

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  useEffect(() => {
    void loadNotifications(1, false);
  }, [loadNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadNotifications(1, false, true);
  }, [loadNotifications]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) {
      return;
    }
    void loadNotifications(page + 1, true);
  }, [hasMore, loadNotifications, loading, loadingMore, page, refreshing]);

  const handlePress = useCallback(
    async (id: string) => {
      const target = notifications.find(item => item.id === id);
      if (!target || !token) {
        return;
      }

      if (!target.read) {
        setNotifications(prev =>
          prev.map(item => (item.id === id ? {...item, read: true} : item)),
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
          const updated = await markNotificationRead(token, id);
          setNotifications(prev =>
            prev.map(item =>
              item.id === id
                ? {
                    ...updated,
                    createdAt: item.createdAt ?? updated.createdAt,
                    audioTimestamp:
                      item.audioTimestamp ?? updated.audioTimestamp,
                    read: true,
                  }
                : item,
            ),
          );
        } catch {
          setNotifications(prev =>
            prev.map(item => (item.id === id ? {...item, read: false} : item)),
          );
          setUnreadCount(prev => prev + 1);
        }
      }

      openFeedAudio(target.audioId);
    },
    [notifications, openFeedAudio, token],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!token || unreadCount === 0 || markingAllRead) {
      return;
    }

    setMarkingAllRead(true);
    try {
      await markAllNotificationsRead(token);
      setNotifications(prev => prev.map(item => ({...item, read: true})));
      setUnreadCount(0);
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : 'Unable to mark notifications as read.',
      );
    } finally {
      setMarkingAllRead(false);
    }
  }, [markingAllRead, token, unreadCount]);

  const renderHeader = () => (
    <Animated.View style={{opacity: headerAnim}}>
      <View style={styles.listHeader}>
        <View style={styles.listHeaderLeft}>
          <View style={styles.livePulseDot} />
          <Text style={styles.listHeaderTitle}>Recent Alerts</Text>
        </View>
        <View style={styles.listHeaderRight}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} NEW</Text>
            </View>
          )}
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={() => void handleMarkAllRead()}
              disabled={markingAllRead}
            >
              {markingAllRead ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={styles.markAllButtonText}>Mark all read</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      );
    }

    return (
      <View style={styles.centeredState}>
        <Text style={styles.emptyText}>
          {loadError ?? 'No notifications yet.'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <Animated.View style={{opacity: headerAnim}}>
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
        extraData={`${relativeTimeTick}:${audioTimestampsVersion}`}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        renderItem={({item}) => (
          <NotificationItem
            item={item}
            entranceAnim={getItemAnim(item.id)}
            audioTimestamps={audioTimestamps}
            resolvedAudioIds={resolvedAudioIds}
            onPress={id => void handlePress(id)}
          />
        )}
      />
    </LinearGradient>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createNotificationStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(5),
    },
    listContentEmpty: {
      flexGrow: 1,
    },
    centeredState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: hp(8),
      paddingHorizontal: wp(8),
    },
    emptyText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.medium,
      color: colors.textMuted,
      textAlign: 'center',
    },
    footerLoader: {
      paddingVertical: hp(2),
    },

    // List header
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: hp(2),
      marginBottom: hp(1.5),
      gap: wp(2),
    },
    listHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    listHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
      flexShrink: 0,
    },
    livePulseDot: {
      width: wp(2.4),
      height: wp(2.4),
      borderRadius: wp(999),
      backgroundColor: colors.primary,
      marginRight: wp(2),
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 0},
      shadowOpacity: 0.9,
      shadowRadius: 6,
      elevation: 6,
    },
    listHeaderTitle: {
      fontSize: responsiveSize(20),
      fontFamily: fonts.bold,
      color: colors.text,
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
      fontFamily: fonts.bold,
      color: colors.primary,
      letterSpacing: responsiveSize(0.6),
    },
    markAllButton: {
      paddingVertical: hp(0.5),
      paddingHorizontal: wp(2),
      minWidth: wp(18),
      alignItems: 'center',
    },
    markAllButtonText: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.semibold,
      color: colors.primary,
    },

    // Card
    card: {
      borderRadius: wp(4),
      marginBottom: hp(1.4),
      borderWidth: 1,
      overflow: 'hidden',
      alignSelf: 'stretch',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.14,
      shadowRadius: 8,
    },
    cardUnread: {
      borderColor: colors.borderMuted,
    },
    cardRead: {
      borderColor: colors.menuItemBorder,
    },
    cardRow: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      width: '100%',
    },
    unreadStrip: {
      width: wp(1),
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 0},
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
      backgroundColor: colors.surfaceElevated,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
      borderWidth: 1,
      borderColor: colors.borderMuted,
      marginTop: hp(0.3),
    },
    iconWrapperRead: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.menuItemBorder,
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
    titleUnread: {
      fontSize: responsiveSize(13.5),
      fontFamily: fonts.bold,
      color: colors.text,
    },
    titleRead: {
      fontSize: responsiveSize(13.5),
      fontFamily: fonts.semibold,
      color: colors.textSecondary,
    },
    timeText: {
      fontSize: responsiveSize(11),
      color: colors.textMuted,
      fontFamily: fonts.medium,
      flexShrink: 0,
      marginTop: hp(0.15),
    },
    messageText: {
      fontSize: responsiveSize(12.5),
      fontFamily: fonts.regular,
      color: colors.text,
      lineHeight: responsiveSize(18),
    },
    messageRead: {
      color: colors.textMuted,
    },
  });

export default NotificationsScreen;
