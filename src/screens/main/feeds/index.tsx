import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { createStyles } from './styles';
import { useTheme, useThemedStyles } from '../../../config/theme';
import {useOpenNotifications} from '../../../navigation/hooks';
import AdvancedFiltersBottomSheet, {
  FilterState as SheetFilterState,
} from '../../../components/feed/AdvancedFiltersBottomSheet';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../../config/constants';
import { responsiveHitSlop } from '../../../utils/responsive';
import {
  addAudioFavorite,
  ApiError,
  listCounties,
  markAudioViewed,
  removeAudioFavorite,
  searchAudio,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import FeedDetailModal from './FeedDetailModal';
import FeedSnippetText from './FeedSnippetText';
import {buildFeedDetail, type FeedItem} from './feedTypes';

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
  keywordPriority: string;
  keywords: string;
  talkgroup: string;
  fromDate: string;
  toDate: string;
};

type County = { id?: string; name: string; code: string; est: string };

const abbreviateCountyLabel = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return '—';
  }
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }
  return words
    .map(word => word[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();
};

const deriveCountiesFromFeed = (items: FeedItem[]): County[] => {
  const map = new Map<string, County>();
  items.forEach(item => {
    const key = item.countyId ?? item.county;
    if (!key || map.has(key)) {
      return;
    }
    map.set(key, {
      id: item.countyId,
      name: item.county,
      code: abbreviateCountyLabel(item.county),
      est: '',
    });
  });
  return Array.from(map.values());
};

const PRIORITY_SEVERITY: Record<string, FeedItem['severity']> = {
  High: 'critical',
  Medium: 'warning',
  Low: 'info',
};

const matchesFeedFilters = (item: FeedItem, filters: AdvancedFeedFilters): boolean => {
  if (filters.counties.length > 0 && !filters.counties.includes(item.county)) {
    return false;
  }
  if (filters.keywordPriority !== 'All') {
    if (filters.keywordPriority === 'Nada') {
      if (item.type !== 'general') return false;
    } else {
      const targetSeverity = PRIORITY_SEVERITY[filters.keywordPriority];
      if (targetSeverity && item.severity !== targetSeverity) {
        return false;
      }
    }
  }
  if (filters.keywords) {
    const query = filters.keywords.toLowerCase();
    const inSnippet = item.snippet.toLowerCase().includes(query);
    const inTalkgroup = item.talkgroup.toLowerCase().includes(query);
    const inHighlights = item.highlightKeywords.some(k =>
      k.toLowerCase().includes(query),
    );
    if (!inSnippet && !inTalkgroup && !inHighlights) {
      return false;
    }
  }
  if (
    filters.talkgroup &&
    !item.talkgroup.toLowerCase().includes(filters.talkgroup.toLowerCase())
  ) {
    return false;
  }
  return true;
};

const DEFAULT_ADVANCED_FILTERS: AdvancedFeedFilters = {
  counties: [],
  keywordPriority: 'All',
  fromDate: '',
  toDate: '',
  keywords: '',
  talkgroup: '',
};

const isFeedFiltersEmpty = (filters: AdvancedFeedFilters) =>
  filters.counties.length === 0 &&
  filters.keywordPriority === 'All' &&
  !filters.fromDate &&
  !filters.toDate &&
  !filters.keywords &&
  !filters.talkgroup;

const sheetFiltersToAdvanced = (
  filters: Pick<
    SheetFilterState,
    | 'counties'
    | 'keywordPriority'
    | 'fromDate'
    | 'toDate'
    | 'keywords'
    | 'talkgroup'
  >,
): AdvancedFeedFilters => ({
  counties: [...filters.counties],
  keywordPriority: filters.keywordPriority,
  fromDate: filters.fromDate,
  toDate: filters.toDate,
  keywords: filters.keywords,
  talkgroup: filters.talkgroup,
});

const advancedFiltersToSheet = (
  filters: AdvancedFeedFilters | null,
): SheetFilterState | null => {
  if (!filters) {
    return null;
  }

  return {
    counties: [...filters.counties],
    keywordPriority: filters.keywordPriority,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    keywords: filters.keywords,
    talkgroup: filters.talkgroup,
    alertStatus: 'Flagged',
    recordsMatched: 0,
  };
};

const CountyCard = ({
  county,
  fadeAnim,
  slideAnim,
  isSelected,
  onPress,
}: {
  county: County;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  isSelected: boolean;
  onPress: () => void;
}) => {
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
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
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.horizontalCardCompact,
            isSelected && styles.horizontalCardCompactSelected,
          ]}
        >
          <View style={styles.horizontalCardIconWrapperCompact}>
            <Image source={images.map} style={styles.horizontalCardIconImage as any} />
          </View>
          <View style={styles.horizontalCardTextCompact}>
            <Text style={styles.horizontalCardTitleCompact} numberOfLines={1}>
              {county.name}
            </Text>
            <View style={styles.horizontalCardMetaRow}>
              <Text style={styles.horizontalCardMetaCompact} numberOfLines={1}>
                {county.code}
              </Text>
              <View style={styles.dotCompact} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const FEED_SNIPPET_MAX_LINES = 2;

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
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: config.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, config.duration]);

  const borderColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [config.dim, config.bright],
  });

  return (
    <Animated.View
      style={[
        styles.feedItemCard,
        styles.feedItemCardAlertBorder,
        { borderColor },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const FeedListItem = ({
  item,
  entranceAnim,
  onToggleStar,
  onPress,
}: {
  item: FeedItem;
  entranceAnim: Animated.Value;
  onToggleStar: (id: string) => void;
  onPress: (item: FeedItem) => void;
}) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  let badgeStyle = styles.feedBadgeGeneral;
  let badgeTextStyle = styles.feedBadgeGeneralText;
  let badgeLabel = 'GENERAL';

  if (item.type === 'fire') {
    badgeStyle = styles.feedBadgeFire;
    badgeTextStyle = styles.feedBadgeFireText;
    badgeLabel = 'FIRE';
  } else if (item.type === 'medical') {
    badgeStyle = styles.feedBadgeMedical;
    badgeTextStyle = styles.feedBadgeMedicalText;
    badgeLabel = 'MEDICAL';
  } else if (item.type === 'police') {
    badgeStyle = styles.feedBadgePolice;
    badgeTextStyle = styles.feedBadgePoliceText;
    badgeLabel = 'POLICE';
  }

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

  const cardContent = (
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
          <View style={[styles.feedBadge, badgeStyle]}>
            <Text style={[styles.feedBadgeText, badgeTextStyle]}>{badgeLabel}</Text>
          </View>
          <Text style={styles.feedCountyText} numberOfLines={1}>
            {/\bcounty\b/i.test(item.county)
              ? item.county.toUpperCase()
              : `${item.county.toUpperCase()} COUNTY`}
          </Text>
        </View>
        <View style={styles.feedTimeColumn}>
          <Text style={styles.feedTimeText}>{item.time}</Text>
          <Text style={styles.feedMetaText}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.feedTalkgroupRow}>
        <Text style={styles.feedTalkgroupText} numberOfLines={1}>
          {item.talkgroup} (ID: {item.talkgroupId})
        </Text>
      </View>

      <FeedSnippetText
        snippet={item.snippet}
        highlightKeywords={item.highlightKeywords}
        numberOfLines={FEED_SNIPPET_MAX_LINES}
      />
    </>
  );

  return (
    <Animated.View style={slideStyle}>
      <Pressable
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {isHighAlert ? (
          <AnimatedAlertFeedCard
            severity={item.severity === 'critical' ? 'critical' : 'warning'}
          >
            {cardContent}
          </AnimatedAlertFeedCard>
        ) : (
          <View style={styles.feedItemCard}>{cardContent}</View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const CountiesScreen = () => {
  const openNotifications = useOpenNotifications();
  const {token} = useAuth();
  const {colors, glass} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [counties, setCounties] = useState<County[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFeedFilters | null>(null);
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);

  // Entrance animations
  const listEntranceAnim = useRef(new Animated.Value(0)).current;
  const cardFades = useRef<Animated.Value[]>([]);
  const cardSlides = useRef<Animated.Value[]>([]);
  const feedItemAnimsRef = useRef<Record<string, Animated.Value>>({});
  const hasMountedRef = useRef(false);

  const getFeedItemAnim = (id: string) => {
    if (!feedItemAnimsRef.current[id]) {
      feedItemAnimsRef.current[id] = new Animated.Value(0);
    }
    return feedItemAnimsRef.current[id];
  };

  const animateFeedList = (items: FeedItem[]) => {
    const anims = items.map(item => {
      const anim = getFeedItemAnim(item.id);
      anim.setValue(0);
      return anim;
    });
    if (anims.length === 0) return;

    Animated.stagger(
      55,
      anims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  const loadCounties = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const countyResults = await listCounties(token);
      const mappedCounties: County[] = countyResults.map(county => ({
        id: county.id,
        name: county.name,
        code: county.code?.trim() || abbreviateCountyLabel(county.name),
        est: county.established || '',
      }));
      setCounties(mappedCounties);
      cardFades.current = mappedCounties.map(() => new Animated.Value(0));
      cardSlides.current = mappedCounties.map(() => new Animated.Value(24));
    } catch (error) {
      if (__DEV__ && error instanceof ApiError) {
        console.warn('[API] counties load failed:', error.message);
      }
    }
  }, [token]);

  const loadFeed = useCallback(async () => {
    if (!token) {
      setLoadingFeed(false);
      return;
    }

    setLoadingFeed(true);
    setFeedError(null);
    try {
      const audioResults = await searchAudio(token, {
        limit: 100,
        counties: advancedFilters?.counties.length
          ? advancedFilters.counties.join(',')
          : undefined,
        keywordPriority:
          advancedFilters?.keywordPriority &&
          advancedFilters.keywordPriority !== 'All'
            ? advancedFilters.keywordPriority
            : undefined,
        keywords: advancedFilters?.keywords || undefined,
        talkgroup: advancedFilters?.talkgroup || undefined,
        fromDate: advancedFilters?.fromDate || undefined,
        toDate: advancedFilters?.toDate || undefined,
      });

      setFeedItems(audioResults);
      setCounties(prev => {
        const fromFeed = deriveCountiesFromFeed(audioResults);
        if (fromFeed.length === 0) {
          return prev;
        }
        const map = new Map<string, County>();
        [...prev, ...fromFeed].forEach(county => {
          const key = county.id ?? county.name;
          map.set(key, county);
        });
        const merged = Array.from(map.values());
        cardFades.current = merged.map(() => new Animated.Value(1));
        cardSlides.current = merged.map(() => new Animated.Value(0));
        return merged;
      });
      animateFeedList(audioResults);
      hasMountedRef.current = true;
    } catch (error) {
      setFeedError(
        error instanceof ApiError ? error.message : 'Unable to load feed.',
      );
    } finally {
      setLoadingFeed(false);
    }
  }, [advancedFilters, token]);

  useEffect(() => {
    loadCounties();
  }, [loadCounties]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (counties.length === 0) {
      return;
    }

    Animated.sequence([
      Animated.timing(listEntranceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(
        90,
        cardFades.current.map((fade, i) =>
          Animated.parallel([
            Animated.spring(fade, {
              toValue: 1,
              friction: 7,
              tension: 60,
              useNativeDriver: true,
            }),
            Animated.spring(cardSlides.current[i], {
              toValue: 0,
              friction: 7,
              tension: 60,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    ]).start();
  }, [counties.length, listEntranceAnim]);

  const handleCountyPress = (county: County) => {
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

  const handleToggleStar = async (itemId: string) => {
    if (!token) {
      return;
    }

    const target = feedItems.find(item => item.id === itemId);
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
  };

  const handleFeedPress = (item: FeedItem) => {
    setSelectedFeedItem(item);
    if (token) {
      markAudioViewed(token, item.id).catch(() => undefined);
    }
  };

  const hasAdvancedFilters =
    advancedFilters !== null && !isFeedFiltersEmpty(advancedFilters);

  const selectedCountyNames = advancedFilters?.counties ?? [];

  const filteredFeed = useMemo(() => {
    const base = advancedFilters
      ? feedItems.filter(item => matchesFeedFilters(item, advancedFilters))
      : feedItems;
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return base;
    }
    return base.filter(
      item =>
        item.snippet.toLowerCase().includes(query) ||
        item.county.toLowerCase().includes(query) ||
        item.talkgroup.toLowerCase().includes(query) ||
        item.highlightKeywords.some(keyword =>
          keyword.toLowerCase().includes(query),
        ),
    );
  }, [feedItems, advancedFilters, searchQuery]);

  const sheetAppliedFilters = advancedFiltersToSheet(advancedFilters);

  const feedListKey = filteredFeed.map(item => item.id).join(',');

  useEffect(() => {
    if (!hasMountedRef.current) return;
    animateFeedList(filteredFeed);
  }, [feedListKey]);

  const selectedFeedDetail = useMemo(
    () => (selectedFeedItem ? buildFeedDetail(selectedFeedItem) : null),
    [selectedFeedItem],
  );

  const renderFeedItem = ({ item }: { item: FeedItem }) => (
    <FeedListItem
      item={item}
      entranceAnim={getFeedItemAnim(item.id)}
      onToggleStar={handleToggleStar}
      onPress={handleFeedPress}
    />
  );

  const renderCountiesStrip = () => (
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
          />
        ))}
      </ScrollView>
    </Animated.View>
  );

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

        {loadingFeed && feedItems.length === 0 ? (
          <View style={styles.feedLoading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            style={styles.feedList}
            data={filteredFeed}
            renderItem={renderFeedItem}
            keyExtractor={item => item.id}
            extraData={feedListKey}
            contentContainerStyle={styles.feedListContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={7}
            ListEmptyComponent={
              <View style={styles.feedEmpty}>
                <Text style={styles.feedEmptyText}>
                  {feedError ?? 'No feed items match your filters.'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <AdvancedFiltersBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        appliedFilters={sheetAppliedFilters}
        onApply={filters => {
          const next = sheetFiltersToAdvanced(filters);
          setAdvancedFilters(isFeedFiltersEmpty(next) ? null : next);
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
