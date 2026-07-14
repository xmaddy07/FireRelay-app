import React, { memo, useCallback, useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  type ViewToken,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { createStyles } from './styles';
import { useTheme, useThemedStyles } from '../../../config/theme';
import {useRoute, useNavigation, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useOpenNotifications} from '../../../navigation/hooks';
import type {FeedStackParamList} from '../../../navigation/types';
import type {CountyListItem} from '../../../api/types/county';
import {
  countyShieldColor,
  countyShieldInitials,
  isCountyOnline,
} from '../../../utils/countyActivity';
import AdvancedFiltersBottomSheet, {
  FilterState as SheetFilterState,
} from '../../../components/feed/AdvancedFiltersBottomSheet';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../../config/constants';
import { responsiveHitSlop } from '../../../utils/responsive';
import {
  addAudioFavorite,
  ApiError,
  getAudioById,
  listAudioNotesByAudioIds,
  markAudioViewed,
  removeAudioFavorite,
  searchAudioWithPagination,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import {useCounties} from '../../../hooks/useCounties';
import {useFeedSocket} from '../../../hooks/useFeedSocket';
import {useAppSelector} from '../../../redux/hooks';
import {
  loadFeedFilters,
  saveFeedFilters,
} from '../../../services/storage/feedFiltersStorage';
import FeedDetailModal from './FeedDetailModal';
import FeedListSkeleton from './FeedListSkeleton';
import CountyStripSkeleton from './CountyStripSkeleton';
import {prefetchFeedAudio, prefetchFeedAudioBatch} from './feedAudioPreload';
import FeedCardNotesPanel from './FeedCardNotesPanel';
import FeedCardMetadataPanel from './FeedCardMetadataPanel';
import FeedSnippetText from './FeedSnippetText';
import {buildFeedDetail, type FeedItem} from './feedTypes';
import {filterDisplayDateToApi} from '../../../utils/filterDate';

const FEED_PAGE_SIZE = 20;
const FEED_AUDIO_PREFETCH_INITIAL = 3;
const FEED_NOTES_BATCH_SIZE = 12;

const ALERT_BORDER_CONFIG = {
  critical: {
    dim: 'rgba(255, 84, 81, 0.16)',
    bright: 'rgba(255, 84, 81, 0.45)',
    duration: 900,
  },
  warning: {
    dim: 'rgba(245, 158, 11, 0.12)',
    bright: 'rgba(245, 158, 11, 0.38)',
    duration: 1200,
  },
};

type AdvancedFeedFilters = {
  counties: string[];
  keywords: string;
  talkgroup: string;
  fromDate: string;
  toDate: string;
  alertStatus: 'All' | 'Flagged';
};

const DEFAULT_ADVANCED_FILTERS: AdvancedFeedFilters = {
  counties: [],
  fromDate: '',
  toDate: '',
  keywords: '',
  talkgroup: '',
  alertStatus: 'All',
};

const isFeedFiltersEmpty = (filters: AdvancedFeedFilters) =>
  filters.counties.length === 0 &&
  filters.alertStatus === 'All' &&
  !filters.fromDate &&
  !filters.toDate &&
  !filters.keywords &&
  !filters.talkgroup;

const sheetFiltersToAdvanced = (
  filters: Pick<
    SheetFilterState,
    | 'counties'
    | 'fromDate'
    | 'toDate'
    | 'keywords'
    | 'talkgroup'
    | 'alertStatus'
  >,
): AdvancedFeedFilters => ({
  counties: [...filters.counties],
  fromDate: filters.fromDate,
  toDate: filters.toDate,
  keywords: filters.keywords,
  talkgroup: filters.talkgroup,
  alertStatus: filters.alertStatus,
});

const advancedFiltersToSheet = (
  filters: AdvancedFeedFilters | null,
): SheetFilterState | null => {
  if (!filters) {
    return null;
  }

  return {
    counties: [...filters.counties],
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    keywords: filters.keywords,
    talkgroup: filters.talkgroup,
    alertStatus: filters.alertStatus,
    recordsMatched: 0,
  };
};

type CountyCardProps = {
  county: CountyListItem;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  isSelected: boolean;
  onPress: () => void;
  onViewPress: () => void;
};

const CountyCard = memo(
  ({
    county,
    fadeAnim,
    slideAnim,
    isSelected,
    onPress,
    onViewPress,
  }: CountyCardProps) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shieldColor = countyShieldColor(county.name);
  const shieldInitials = countyShieldInitials(county.name, county.code);
  const {activity} = county;
  const isOnline = isCountyOnline(activity.status);
  const userLabel =
    county.userCount === 1 ? '1 User' : `${county.userCount} Users`;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          { translateX: slideAnim },
          { scale: scaleAnim },
        ],
      }}
    >
      <View
        style={[
          styles.countyFeedCard,
          isSelected && styles.countyFeedCardSelected,
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.countyFeedCardHeader}>
            <View
              style={[
                styles.countyFeedCardShield,
                {borderColor: shieldColor, backgroundColor: `${shieldColor}18`},
              ]}
            >
              <Text style={[styles.countyFeedCardShieldText, {color: shieldColor}]}>
                {shieldInitials}
              </Text>
            </View>
            <View style={styles.countyFeedCardTitleBlock}>
              <Text style={styles.countyFeedCardTitle} numberOfLines={1}>
                {county.name}
              </Text>
              <Text style={styles.countyFeedCardSubtitle} numberOfLines={1}>
                {county.locationLabel}
              </Text>
            </View>
            <View style={styles.countyFeedCardStatusDotWrap}>
              <View
                style={[
                  styles.countyFeedCardStatusDot,
                  isOnline
                    ? styles.countyFeedCardStatusDotOnline
                    : styles.countyFeedCardStatusDotOffline,
                ]}
              />
            </View>
          </View>

          <View style={styles.countyFeedCardLastActiveRow}>
            <Icon name="clock" size={11} color={colors.textMuted} />
            <Text style={styles.countyFeedCardLastActiveText}>
              {activity.lastActiveLabel}
            </Text>
          </View>
        </Pressable>

        <View style={styles.countyFeedCardFooter}>
          <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.countyFeedCardUsersRow}
          >
            <Icon name="users" size={11} color={colors.textMuted} />
            <Text style={styles.countyFeedCardUsersText} numberOfLines={1}>
              {userLabel}
            </Text>
          </Pressable>
          <Pressable
            onPress={onViewPress}
            hitSlop={responsiveHitSlop(2)}
            style={styles.countyFeedCardViewLinkWrap}
          >
            <View style={styles.countyFeedCardViewLinkRow}>
              <Text style={styles.countyFeedCardViewLink}>View</Text>
              <Icon name="chevron-right" size={12} color={colors.primary} />
            </View>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
  },
);

const FEED_SNIPPET_MAX_LINES = 2;

type FeedExpandedPanel = {
  id: string;
  type: 'notes' | 'metadata';
};

const AnimatedAlertFeedCard = ({
  severity,
  children,
}: {
  severity: 'critical' | 'warning';
  children: React.ReactNode;
}) => {
  const styles = useThemedStyles(createStyles);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const config = ALERT_BORDER_CONFIG[severity];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: config.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, config.duration]);

  const overlayOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.85],
  });

  return (
    <View
      style={[
        styles.feedItemCard,
        styles.feedItemCardAlertBorder,
        {borderColor: config.dim},
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.feedItemCardAlertPulse,
          {
            borderColor: config.bright,
            opacity: overlayOpacity,
          },
        ]}
      />
      {children}
    </View>
  );
};

type FeedListItemProps = {
  item: FeedItem;
  entranceAnim: Animated.Value;
  onToggleStar: (id: string) => void;
  onPress: (item: FeedItem) => void;
  onPressIn: (item: FeedItem) => void;
  expandedPanel: FeedExpandedPanel | null;
  onToggleNotes: (id: string) => void;
  onToggleMetadata: (id: string) => void;
  onNotesCountChange: (audioId: string, count: number) => void;
  notesCount?: number;
  token?: string;
  currentUserId?: string;
  isAdmin?: boolean;
};

const FeedListItem = memo(
  ({
    item,
    entranceAnim,
    onToggleStar,
    onPress,
    onPressIn,
    expandedPanel,
    onToggleNotes,
    onToggleMetadata,
    onNotesCountChange,
    notesCount = 0,
    token,
    currentUserId,
    isAdmin,
  }: FeedListItemProps) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  let badgeLabel = 'GENERAL';

  if (item.type === 'fire') {
    badgeLabel = 'FIRE';
  } else if (item.type === 'medical') {
    badgeLabel = 'MEDICAL';
  } else if (item.type === 'police') {
    badgeLabel = 'POLICE';
  }

  const severityColorStyle =
    item.severity === 'critical'
      ? styles.feedBadgeSeverityCritical
      : item.severity === 'warning'
        ? styles.feedBadgeSeverityWarning
        : styles.feedBadgeSeverityInfo;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const slideStyle = {
    opacity: entranceAnim,
    transform: [
      {
        translateY: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      { scale: scaleAnim },
    ],
  };

  const isHighAlert = item.severity === 'critical' || item.severity === 'warning';
  const notesExpanded =
    expandedPanel?.id === item.id && expandedPanel.type === 'notes';
  const metadataExpanded =
    expandedPanel?.id === item.id && expandedPanel.type === 'metadata';
  const isCardExpanded = notesExpanded || metadataExpanded;

  const cardInner = (
    <>
      <View style={styles.feedItemHeader}>
        <Pressable
          style={styles.feedStarButton}
          onPress={() => onToggleStar(item.id)}
          hitSlop={responsiveHitSlop(2)}
        >
          <Text
            style={[
              styles.feedStarIcon,
              item.starred ? styles.feedStarIconActive : styles.feedStarIconInactive,
            ]}
          >
            {item.starred ? '★' : '☆'}
          </Text>
        </Pressable>
        <View style={styles.feedItemBadgeContainer}>
          <View style={[styles.feedBadge, severityColorStyle]}>
            <Text style={[styles.feedBadgeText, styles.feedBadgeSeverityText]}>
              {badgeLabel}
            </Text>
          </View>
          <Text style={styles.feedCountyText} numberOfLines={1}>
            {/\bcounty\b/i.test(item.county)
              ? item.county.toUpperCase()
              : `${item.county.toUpperCase()} COUNTY`}
          </Text>
        </View>
        <View style={styles.feedCardHeaderActions}>
          <Pressable
            style={[
              styles.feedCardActionButton,
              metadataExpanded && styles.feedCardActionButtonActive,
            ]}
            onPress={() => onToggleMetadata(item.id)}
            hitSlop={responsiveHitSlop(2)}
          >
            <Icon
              name="eye"
              size={14}
              color={metadataExpanded ? colors.primary : colors.textMuted}
            />
          </Pressable>
          <View style={styles.feedCardActionButtonWrap}>
            <Pressable
              style={[
                styles.feedCardActionButton,
                notesExpanded && styles.feedCardActionButtonActive,
              ]}
              onPress={() => onToggleNotes(item.id)}
              hitSlop={responsiveHitSlop(2)}
            >
              <Icon
                name="file-text"
                size={14}
                color={notesExpanded ? colors.primary : colors.textMuted}
              />
            </Pressable>
            {notesCount > 0 ? (
              <View style={styles.feedCardNotesBadge}>
                <Text style={styles.feedCardNotesBadgeText}>
                  {notesCount > 9 ? '9+' : notesCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.feedTimeColumn}>
          <Text style={styles.feedTimeText}>{item.time}</Text>
          <Text style={styles.feedMetaText}>{item.date}</Text>
        </View>
      </View>

      <Pressable
        style={styles.feedCardBodyPressable}
        onPress={() => onPress(item)}
        onPressIn={() => {
          handlePressIn();
          onPressIn(item);
        }}
        onPressOut={handlePressOut}
      >
        <View style={styles.feedTalkgroupRow}>
          <View style={styles.feedTalkgroupPill}>
            <Text style={styles.feedTalkgroupText} numberOfLines={1}>
              {item.talkgroup}
            </Text>
          </View>
          <View style={[styles.feedSeverityPill, severityColorStyle]}>
            <Text style={[styles.feedSeverityPillText, styles.feedBadgeSeverityText]}>
              {item.maxSeverityLabel}
            </Text>
          </View>
        </View>

        <FeedSnippetText
          snippet={item.snippet}
          highlightKeywords={item.highlightKeywords}
          severity={item.severity}
          numberOfLines={FEED_SNIPPET_MAX_LINES}
        />
      </Pressable>

      {metadataExpanded ? (
        <FeedCardMetadataPanel item={item} expanded />
      ) : null}

      {notesExpanded ? (
        <FeedCardNotesPanel
          audioId={item.id}
          expanded
          token={token}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onNotesCountChange={count => onNotesCountChange(item.id, count)}
        />
      ) : null}
    </>
  );

  const cardShell = isHighAlert ? (
    <AnimatedAlertFeedCard
      severity={item.severity === 'critical' ? 'critical' : 'warning'}
    >
      {cardInner}
    </AnimatedAlertFeedCard>
  ) : (
    <View style={styles.feedItemCard}>{cardInner}</View>
  );

  return (
    <Animated.View
      style={[
        slideStyle,
        isCardExpanded ? styles.feedCardWrapperExpanded : styles.feedCardWrapper,
      ]}
    >
      {cardShell}
    </Animated.View>
  );
  },
);

const CountiesScreen = () => {
  const openNotifications = useOpenNotifications();
  const route = useRoute<RouteProp<FeedStackParamList, 'FeedList'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const {token} = useAuth();
  const userKey =
    useAppSelector(state => state.user.id ?? state.user.email) ?? '';
  const currentUserId = useAppSelector(state => state.user.id);
  const isAdmin = useAppSelector(state => state.user.role) === 'admin';
  const {colors, glass} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFeedFilters | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<FeedExpandedPanel | null>(null);
  const [feedNotesCounts, setFeedNotesCounts] = useState<Record<string, number>>(
    {},
  );
  const [notesCountsRevision, setNotesCountsRevision] = useState(0);
  const notesFetchedRef = useRef(new Set<string>());
  const notesFetchInflightRef = useRef(new Set<string>());
  const feedItemsRef = useRef(feedItems);
  feedItemsRef.current = feedItems;
  const feedLoadGenerationRef = useRef(0);
  const {counties, loading: loadingCounties, error: countiesError} = useCounties({
    enabled: Boolean(token),
    feedItems,
  });

  useEffect(() => {
    let cancelled = false;

    if (!userKey) {
      setAdvancedFilters(null);
      setFiltersReady(true);
      return () => {
        cancelled = true;
      };
    }

    setFiltersReady(false);
    (async () => {
      const saved = await loadFeedFilters(userKey);
      if (cancelled) {
        return;
      }
      setAdvancedFilters(saved && !isFeedFiltersEmpty(saved) ? saved : null);
      setFiltersReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [userKey]);

  useEffect(() => {
    if (!filtersReady || !userKey) {
      return;
    }
    const toSave =
      advancedFilters && !isFeedFiltersEmpty(advancedFilters)
        ? advancedFilters
        : null;
    void saveFeedFilters(userKey, toSave);
  }, [advancedFilters, userKey, filtersReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedSearchQuery(prev => {
        if (trimmed !== prev) {
          setLoadingFeed(true);
        }
        return trimmed;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Entrance animations
  const listEntranceAnim = useRef(new Animated.Value(1)).current;
  const cardFades = useRef<Animated.Value[]>([]);
  const cardSlides = useRef<Animated.Value[]>([]);
  const feedItemAnimsRef = useRef<Record<string, Animated.Value>>({});
  const hasPlayedFeedEntranceRef = useRef(false);
  const hasPlayedCountiesEntranceRef = useRef(false);

  const getFeedItemAnim = useCallback((id: string) => {
    if (!feedItemAnimsRef.current[id]) {
      feedItemAnimsRef.current[id] = new Animated.Value(1);
    }
    return feedItemAnimsRef.current[id];
  }, []);

  const settleFeedItemAnims = useCallback((items: FeedItem[]) => {
    items.forEach(item => getFeedItemAnim(item.id).setValue(1));
    hasPlayedFeedEntranceRef.current = true;
  }, [getFeedItemAnim]);

  const loadFeed = useCallback(async (pageToLoad = 1, append = false) => {
    if (!token) {
      feedLoadGenerationRef.current += 1;
      setLoadingFeed(false);
      setLoadingMoreFeed(false);
      setFeedHasMore(false);
      return;
    }

    const generation = ++feedLoadGenerationRef.current;
    if (append) {
      setLoadingMoreFeed(true);
    } else {
      setLoadingFeed(true);
    }
    setFeedError(null);
    try {
      const alertStatus = advancedFilters?.alertStatus ?? 'All';
      const audioResult = await searchAudioWithPagination(token, {
        page: pageToLoad,
        limit: FEED_PAGE_SIZE,
        counties: advancedFilters?.counties.length
          ? advancedFilters.counties.join(',')
          : undefined,
        keywords: advancedFilters?.keywords || undefined,
        talkgroup: advancedFilters?.talkgroup || undefined,
        fromDate: advancedFilters?.fromDate
          ? filterDisplayDateToApi(advancedFilters.fromDate)
          : undefined,
        toDate: advancedFilters?.toDate
          ? filterDisplayDateToApi(advancedFilters.toDate)
          : undefined,
        search: debouncedSearchQuery || undefined,
        flagged: alertStatus === 'Flagged' ? true : undefined,
      });

      if (generation !== feedLoadGenerationRef.current) {
        return;
      }

      const filteredResults =
        alertStatus === 'Flagged'
          ? audioResult.items.filter(item => item.hasWarning)
          : audioResult.items;

      setFeedItems(prev => {
        if (!append) {
          return filteredResults;
        }
        const existingIds = new Set(prev.map(item => item.id));
        return [
          ...prev,
          ...filteredResults.filter(item => !existingIds.has(item.id)),
        ];
      });
      setFeedPage(pageToLoad);
      setFeedHasMore(audioResult.hasMore);

      if (!append) {
        notesFetchedRef.current.clear();
        setFeedNotesCounts({});
      }
      settleFeedItemAnims(filteredResults);
      prefetchFeedAudioBatch(
        filteredResults.slice(0, FEED_AUDIO_PREFETCH_INITIAL).map(item => ({
          id: item.id,
          audioFilename: item.audioFilename,
          audioUrl: item.audioUrl,
        })),
      );
    } catch (error) {
      if (generation !== feedLoadGenerationRef.current) {
        return;
      }
      if (!append) {
        setFeedItems([]);
        setFeedHasMore(false);
      }
      setFeedError(
        error instanceof ApiError ? error.message : 'Unable to load feed.',
      );
    } finally {
      if (generation === feedLoadGenerationRef.current) {
        setLoadingFeed(false);
        setLoadingMoreFeed(false);
      }
    }
  }, [advancedFilters, token, debouncedSearchQuery, settleFeedItemAnims]);

  useEffect(() => {
    if (!filtersReady) {
      return;
    }
    void loadFeed(1, false);
  }, [loadFeed, filtersReady]);

  const handleLoadMoreFeed = useCallback(() => {
    if (loadingFeed || loadingMoreFeed || !feedHasMore) {
      return;
    }
    void loadFeed(feedPage + 1, true);
  }, [feedHasMore, feedPage, loadFeed, loadingFeed, loadingMoreFeed]);
  useEffect(() => {
    if (counties.length === 0) {
      return;
    }

    listEntranceAnim.setValue(1);
    cardFades.current.forEach(fade => fade.setValue(1));
    cardSlides.current.forEach(slide => slide.setValue(0));
    hasPlayedCountiesEntranceRef.current = true;
  }, [counties.length, listEntranceAnim]);

  useEffect(() => {
    cardFades.current = counties.map(
      (_, index) => cardFades.current[index] ?? new Animated.Value(1),
    );
    cardSlides.current = counties.map(
      (_, index) => cardSlides.current[index] ?? new Animated.Value(0),
    );
  }, [counties.length]);

  const handleCountyPress = (county: CountyListItem) => {
    setAdvancedFilters(prev => {
      const current = prev ?? { ...DEFAULT_ADVANCED_FILTERS };
      const isSelected = current.counties.includes(county.name);
      const nextCounties = isSelected
        ? current.counties.filter(name => name !== county.name)
        : [...current.counties, county.name];
      const next = { ...current, counties: nextCounties };
      return isFeedFiltersEmpty(next) ? null : next;
    });
  };

  const handleCountyView = (county: CountyListItem) => {
    navigation.navigate('CountyDetail', {
      countyId: county.id,
      countyName: county.name,
      countySeed: county,
    });
  };

  const handleToggleStar = useCallback(async (itemId: string) => {
    if (!token) {
      return;
    }

    const target = feedItemsRef.current.find(item => item.id === itemId);
    if (!target) {
      return;
    }

    const nextStarred = !target.starred;
    setFeedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, starred: nextStarred } : item
      )
    );

    try {
      if (nextStarred) {
        await addAudioFavorite(token, itemId);
      } else {
        await removeAudioFavorite(token, itemId);
      }
    } catch (error) {
      setFeedItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, starred: !nextStarred } : item
        )
      );
      if (__DEV__ && error instanceof ApiError) {
        console.warn('[API] favorite toggle failed:', error.message);
      }
    }
  }, [token]);

  const handleFeedAudioPreload = useCallback((item: FeedItem) => {
    prefetchFeedAudio(item.id, item.audioFilename, item.audioUrl);
  }, []);

  const handleFeedPress = useCallback((item: FeedItem) => {
    handleFeedAudioPreload(item);
    setSelectedFeedItem(item);
    if (token) {
      markAudioViewed(token, item.id).catch(() => undefined);
    }
  }, [handleFeedAudioPreload, token]);

  const feedViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 20,
  }).current;

  const fetchNotesCountsForIds = useCallback(
    async (ids: string[]) => {
      if (!token) {
        return;
      }

      const pending = ids.filter(id => {
        if (notesFetchInflightRef.current.has(id)) {
          return false;
        }
        if (notesFetchedRef.current.has(id)) {
          return false;
        }
        return true;
      });

      if (pending.length === 0) {
        return;
      }

      pending.forEach(id => notesFetchInflightRef.current.add(id));

      try {
        for (let index = 0; index < pending.length; index += FEED_NOTES_BATCH_SIZE) {
          const batch = pending.slice(index, index + FEED_NOTES_BATCH_SIZE);
          const grouped = await listAudioNotesByAudioIds(token, batch);
          batch.forEach(id => notesFetchedRef.current.add(id));
          setFeedNotesCounts(prev => {
            const next = {...prev};
            batch.forEach(id => {
              next[id] = grouped[id]?.length ?? 0;
            });
            return next;
          });
          setNotesCountsRevision(revision => revision + 1);
        }
      } catch (error) {
        if (__DEV__ && error instanceof ApiError) {
          console.warn('[API] feed notes counts failed:', error.message);
        }
      } finally {
        pending.forEach(id => notesFetchInflightRef.current.delete(id));
      }
    },
    [token],
  );

  const handleFeedViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      const indices = new Set<number>();
      const visibleIds: string[] = [];

      viewableItems.forEach(token => {
        if (!token.isViewable || token.index == null) {
          return;
        }
        indices.add(token.index);
        indices.add(token.index + 1);

        const feedItem = feedItemsRef.current[token.index];
        if (feedItem) {
          visibleIds.push(feedItem.id);
        }
      });

      indices.forEach(index => {
        const feedItem = feedItemsRef.current[index];
        if (feedItem) {
          prefetchFeedAudio(
            feedItem.id,
            feedItem.audioFilename,
            feedItem.audioUrl,
          );
        }
      });

      void fetchNotesCountsForIds(visibleIds);
    },
    [fetchNotesCountsForIds],
  );

  const hasAdvancedFilters =
    advancedFilters !== null && !isFeedFiltersEmpty(advancedFilters);

  const selectedCountyNames = advancedFilters?.counties ?? [];

  const sheetAppliedFilters = advancedFiltersToSheet(advancedFilters);

  const feedListExtraData = `${expandedPanel?.id ?? ''}:${expandedPanel?.type ?? ''}:${notesCountsRevision}`;

  const handleNotesCountChange = useCallback((audioId: string, count: number) => {
    notesFetchedRef.current.add(audioId);
    setFeedNotesCounts(prev => {
      if ((prev[audioId] ?? 0) === count) {
        return prev;
      }
      return {...prev, [audioId]: count};
    });
  }, []);

  const handleToggleNotes = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPanel(prev =>
      prev?.id === id && prev.type === 'notes' ? null : {id, type: 'notes'},
    );
  }, []);

  const handleToggleMetadata = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPanel(prev =>
      prev?.id === id && prev.type === 'metadata'
        ? null
        : {id, type: 'metadata'},
    );
  }, []);

  const selectedFeedDetail = useMemo(
    () => (selectedFeedItem ? buildFeedDetail(selectedFeedItem) : null),
    [selectedFeedItem],
  );

  useEffect(() => {
    const audioId = route.params?.audioId;
    if (!audioId || !token) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const item = await getAudioById(token, audioId);
        if (cancelled) {
          return;
        }

        setFeedItems(prev => {
          if (prev.some(existing => existing.id === item.id)) {
            return prev;
          }
          return [item, ...prev];
        });
        prefetchFeedAudio(item.id, item.audioFilename, item.audioUrl);
        setSelectedFeedItem(item);
      } catch (error) {
        if (!cancelled) {
          setFeedError(
            error instanceof ApiError
              ? error.message
              : 'Unable to open this alert.',
          );
        }
      } finally {
        if (!cancelled) {
          navigation.setParams({audioId: undefined});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation, route.params?.audioId, token]);

  const animateLiveFeedItem = useCallback(
    (id: string) => {
      const anim = getFeedItemAnim(id);
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }).start();
    },
    [getFeedItemAnim],
  );

  const handleLiveNewAudio = useCallback(
    (item: FeedItem) => {
      setFeedItems(prev => {
        if (prev.some(existing => existing.id === item.id)) {
          return prev;
        }
        return [item, ...prev];
      });
      prefetchFeedAudio(item.id, item.audioFilename, item.audioUrl);
      animateLiveFeedItem(item.id);
    },
    [animateLiveFeedItem],
  );

  const handleLiveAudioUpdated = useCallback((item: FeedItem) => {
    setFeedItems(prev => {
      const index = prev.findIndex(existing => existing.id === item.id);
      if (index === -1) {
        return [item, ...prev];
      }
      const next = [...prev];
      next[index] = {...next[index], ...item};
      return next;
    });
  }, []);

  const handleLiveAudioDeleted = useCallback(
    ({id}: {id: string}) => {
      setFeedItems(prev => prev.filter(item => item.id !== id));
      if (selectedFeedItem?.id === id) {
        setSelectedFeedItem(null);
      }
      if (expandedPanel?.id === id) {
        setExpandedPanel(null);
      }
    },
    [expandedPanel?.id, selectedFeedItem?.id],
  );

  useFeedSocket({
    token: token ?? null,
    enabled: filtersReady && Boolean(token),
    counties,
    selectedCountyNames,
    filters: advancedFilters,
    searchQuery: debouncedSearchQuery,
    onNewAudio: handleLiveNewAudio,
    onAudioUpdated: handleLiveAudioUpdated,
    onAudioDeleted: handleLiveAudioDeleted,
  });

  const renderFeedItem = useCallback(
    ({item}: {item: FeedItem}) => (
      <FeedListItem
        item={item}
        entranceAnim={getFeedItemAnim(item.id)}
        onToggleStar={handleToggleStar}
        onPress={handleFeedPress}
        onPressIn={handleFeedAudioPreload}
        expandedPanel={expandedPanel}
        onToggleNotes={handleToggleNotes}
        onToggleMetadata={handleToggleMetadata}
        onNotesCountChange={handleNotesCountChange}
        notesCount={feedNotesCounts[item.id] ?? 0}
        token={token}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    ),
    [
      currentUserId,
      expandedPanel,
      feedNotesCounts,
      getFeedItemAnim,
      handleFeedAudioPreload,
      handleNotesCountChange,
      handleToggleMetadata,
      handleToggleNotes,
      handleFeedPress,
      handleToggleStar,
      isAdmin,
      token,
    ],
  );

  const renderCountiesStrip = () => {
    if (loadingCounties && counties.length === 0) {
      return (
        <Animated.View style={{opacity: listEntranceAnim}}>
          <CountyStripSkeleton />
        </Animated.View>
      );
    }

    if (countiesError && counties.length === 0) {
      return (
        <Animated.View style={{opacity: listEntranceAnim}}>
          <View style={styles.feedEmpty}>
            <Text style={styles.feedEmptyText}>{countiesError}</Text>
          </View>
        </Animated.View>
      );
    }

    return (
    <Animated.View style={{ opacity: listEntranceAnim }}>
      {/* <View style={styles.sectionHeaderCompact}>
        <Text style={styles.sectionTitleCompact}>Counties</Text>
        <View style={styles.countBadgeCompact}>
          <Text style={styles.countBadgeTextCompact}>{counties.length} ACTIVE</Text>
        </View>
      </View> */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
        style={styles.countiesHorizontalContainer}
      >
        {counties.map((county, index) => (
          <CountyCard
            key={county.id ?? county.name}
            county={county}
            fadeAnim={cardFades.current[index] ?? new Animated.Value(1)}
            slideAnim={cardSlides.current[index] ?? new Animated.Value(0)}
            isSelected={selectedCountyNames.includes(county.name)}
            onPress={() => handleCountyPress(county)}
            onViewPress={() => handleCountyView(county)}
          />
        ))}
      </ScrollView>
    </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={[...glass.screenGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[StyleSheet.absoluteFill, styles.screenBody]}>
        <Animated.View style={[styles.toolbarRow, {opacity: listEntranceAnim}]}>
          <View style={styles.searchBar}>
            <Icon
              name="search"
              size={18}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search feed..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[
                styles.searchBarFilterButton,
                hasAdvancedFilters && styles.searchBarFilterButtonActive,
              ]}
              onPress={() => setFilterSheetVisible(true)}
              activeOpacity={0.7}
              hitSlop={responsiveHitSlop(1.6)}
            >
              <Image
                source={images.filter}
                style={[
                  styles.filterIcon,
                  hasAdvancedFilters && styles.filterIconActive,
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.7}
            onPress={openNotifications}
            hitSlop={responsiveHitSlop(2)}
          >
            <Image
              source={images.notification}
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>

        {renderCountiesStrip()}

        <FlatList
          style={styles.feedList}
          data={feedItems}
          renderItem={renderFeedItem}
          keyExtractor={item => item.id}
          extraData={feedListExtraData}
          contentContainerStyle={styles.feedListContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={7}
          onViewableItemsChanged={handleFeedViewableItemsChanged}
          viewabilityConfig={feedViewabilityConfig}
          onEndReached={handleLoadMoreFeed}
          onEndReachedThreshold={0.6}
          ListHeaderComponent={
            feedError && feedItems.length > 0 ? (
              <View style={styles.feedEmpty}>
                <Text style={styles.feedEmptyText}>{feedError}</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loadingMoreFeed ? (
              <View style={styles.feedLoadMoreFooter}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.feedLoadMoreText}>Loading more…</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            loadingFeed ? (
              <FeedListSkeleton />
            ) : (
              <View style={styles.feedEmpty}>
                <Text style={styles.feedEmptyText}>
                  {feedError ?? 'No feed items match your filters.'}
                </Text>
              </View>
            )
          }
        />
      </View>

      <AdvancedFiltersBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        appliedFilters={sheetAppliedFilters}
        availableCounties={counties.map(c => c.name)}
        onApply={filters => {
          const next = sheetFiltersToAdvanced(filters);
          const applied = isFeedFiltersEmpty(next) ? null : next;
          setAdvancedFilters(applied);
          if (userKey) {
            void saveFeedFilters(userKey, applied);
          }
        }}
      />

      <FeedDetailModal
        visible={selectedFeedItem !== null}
        item={selectedFeedItem}
        detail={selectedFeedDetail}
        onClose={() => setSelectedFeedItem(null)}
      />
    </LinearGradient>
  );
};

export default CountiesScreen;
