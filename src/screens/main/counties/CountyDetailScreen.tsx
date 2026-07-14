import React, {useMemo} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {useCountyDetail} from '../../../hooks/useCounties';
import {
  countyAvatarColor,
  countyShieldColor,
  countyShieldInitials,
  emailInitials,
  formatCountyLocationLabel,
  isCountyOnline,
} from '../../../utils/countyActivity';
import type {FeedStackParamList} from '../../../navigation/types';
import {responsiveHitSlop} from '../../../utils/responsive';
import {createStyles} from './countyDetail.styles';

const CountyDetailScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const route = useRoute<RouteProp<FeedStackParamList, 'CountyDetail'>>();
  const {countyId, countyName, countySeed} = route.params;
  const {county, connectedUsers, loading, loadingUsers, error} = useCountyDetail(
    countyId,
    countySeed ?? null,
  );
  const {colors, glass} = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const title = county?.name ?? countyName ?? 'County';
  const locationLabel = county
    ? county.locationLabel
    : formatCountyLocationLabel(undefined, undefined);
  const shieldColor = countyShieldColor(title);
  const shieldCode = countyShieldInitials(title, county?.code);
  const isOnline = county ? isCountyOnline(county.activity.status) : false;

  const statusStyles = useMemo(() => {
    const status = county?.activity.status ?? 'offline';
    if (status === 'live') {
      return {
        badge: styles.statusBadgeLive,
        text: styles.statusBadgeTextLive,
      };
    }
    if (status === 'active') {
      return {
        badge: styles.statusBadgeActive,
        text: styles.statusBadgeTextActive,
      };
    }
    return {
      badge: styles.statusBadgeOffline,
      text: styles.statusBadgeTextOffline,
    };
  }, [county?.activity.status, styles]);

  const userCountLabel =
    (county?.userCount ?? connectedUsers.length) === 1
      ? '1 User'
      : `${county?.userCount ?? connectedUsers.length} Users`;

  const showInitialLoader = loading && !county;
  const showUsersLoader = loadingUsers && connectedUsers.length === 0;

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}
    >
      <View style={[styles.screen, {paddingTop: insets.top + 8}]}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={responsiveHitSlop(1.5)}
          >
            <Icon name="arrow-left" size={20} color={colors.iconTint} />
          </Pressable>
          <View style={styles.topBarTitleBlock}>
            <Text style={styles.topBarTitle} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.topBarSubtitle} numberOfLines={1}>
              {locationLabel}
            </Text>
          </View>
        </View>

        {showInitialLoader ? (
          <View style={styles.scrollContent}>
            <View style={styles.skeletonHero} />
            <View style={styles.skeletonUsers} />
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{marginTop: 8}}
            />
          </View>
        ) : error && !county ? (
          <View style={styles.centered}>
            <View style={styles.emptyIconWrap}>
              <Icon name="alert-circle" size={22} color={colors.primary} />
            </View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View
                  style={[
                    styles.shield,
                    {
                      borderColor: shieldColor,
                      backgroundColor: `${shieldColor}18`,
                    },
                  ]}
                >
                  <Text style={[styles.shieldText, {color: shieldColor}]}>
                    {shieldCode}
                  </Text>
                </View>

                <View style={styles.heroMain}>
                  <View style={styles.heroTitleRow}>
                    <Text style={styles.heroName}>{title}</Text>
                    <View
                      style={[
                        styles.statusDot,
                        isOnline
                          ? styles.statusDotOnline
                          : styles.statusDotOffline,
                      ]}
                    />
                  </View>
                  <Text style={styles.heroLocation}>{locationLabel}</Text>
                  <View style={[styles.statusBadge, statusStyles.badge]}>
                    <Text style={[styles.statusBadgeText, statusStyles.text]}>
                      {county?.activity.badgeLabel ?? 'Offline'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Connected</Text>
                  <Text style={styles.statValue}>{userCountLabel}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Last active</Text>
                  <Text style={styles.statValue}>
                    {county?.activity.lastActiveLabel ?? 'No activity'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connected users</Text>
              <View style={styles.sectionCountPill}>
                <Text style={styles.sectionCountText}>
                  {loadingUsers && connectedUsers.length === 0
                    ? '…'
                    : connectedUsers.length}
                </Text>
              </View>
            </View>

            {showUsersLoader ? (
              <View style={styles.emptyCard}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.emptyText}>Loading users…</Text>
              </View>
            ) : connectedUsers.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Icon name="users" size={22} color={colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No connected users</Text>
                <Text style={styles.emptyText}>
                  No users are assigned to this county yet.
                </Text>
              </View>
            ) : (
              <View style={styles.usersCard}>
                {connectedUsers.map((user, index) => {
                  const avatarColor = countyAvatarColor(user.email);
                  const isLast = index === connectedUsers.length - 1;

                  return (
                    <View
                      key={user.id}
                      style={[styles.userRow, isLast && styles.userRowLast]}
                    >
                      <View
                        style={[
                          styles.avatar,
                          {
                            borderColor: `${avatarColor}55`,
                            backgroundColor: `${avatarColor}18`,
                          },
                        ]}
                      >
                        <Text style={[styles.avatarText, {color: avatarColor}]}>
                          {emailInitials(user.email)}
                        </Text>
                      </View>
                      <View style={styles.userTextBlock}>
                        <Text style={styles.userEmail} numberOfLines={1}>
                          {user.email}
                        </Text>
                        <Text style={styles.userMeta}>County access</Text>
                      </View>
                      <Icon
                        name="chevron-right"
                        size={16}
                        color={colors.textMuted}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
};

export default CountyDetailScreen;
