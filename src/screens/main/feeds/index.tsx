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
  LayoutAnimation,
  Platform,
  UIManager,
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
import {useFeedSocket} from '../../../hooks/useFeedSocket';
import {useAppSelector} from '../../../redux/hooks';
import {
  loadFeedFilters,
  saveFeedFilters,
} from '../../../services/storage/feedFiltersStorage';
import FeedDetailModal from './FeedDetailModal';
import FeedCardNotesPanel from './FeedCardNotesPanel';
import FeedCardMetadataPanel from './FeedCardMetadataPanel';
import FeedSnippetText from './FeedSnippetText';
import {buildFeedDetail, type FeedItem} from './feedTypes';
import {filterDisplayDateToApi} from '../../../utils/filterDate';

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
  expandedPanel,
  onToggleNotes,
  onToggleMetadata,
  token,
  currentUserId,
  isAdmin,
}: {
  item: FeedItem;
  entranceAnim: Animated.Value;
  onToggleStar: (id: string) => void;
  onPress: (item: FeedItem) => void;
  expandedPanel: FeedExpandedPanel | null;
  onToggleNotes: (id: string) => void;
  onToggleMetadata: (id: string) => void;
  token?: string;
  currentUserId?: string;
  isAdmin?: boolean;
}) => {
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
        </View>
        <View style={styles.feedTimeColumn}>
          <Text style={styles.feedTimeText}>{item.time}</Text>
          <Text style={styles.feedMetaText}>{item.date}</Text>
        </View>
      </View>

      <Pressable
        style={styles.feedCardBodyPressable}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
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

      <FeedCardMetadataPanel item={item} expanded={metadataExpanded} />

      <FeedCardNotesPanel
        audioId={item.id}
        expanded={notesExpanded}
        token={token}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
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
};

const CountiesScreen = () => {
  const openNotifications = useOpenNotifications();
  const {token} = useAuth();
  const userKey =
    useAppSelector(state => state.user.id ?? state.user.email) ?? '';
  const currentUserId = useAppSelector(state => state.user.id);
  const isAdmin = useAppSelector(state => state.user.role) === 'admin';
  const {colors, glass} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [counties, setCounties] = useState<County[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFeedFilters | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<FeedExpandedPanel | null>(null);

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
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Entrance animations
  const listEntranceAnim = useRef(new Animated.Value(0)).current;
  const cardFades = useRef<Animated.Value[]>([]);
  const cardSlides = useRef<Animated.Value[]>([]);
  const feedItemAnimsRef = useRef<Record<string, Animated.Value>>({});
  const hasPlayedFeedEntranceRef = useRef(false);
  const hasPlayedCountiesEntranceRef = useRef(false);

  const getFeedItemAnim = useCallback((id: string) => {
    if (!feedItemAnimsRef.current[id]) {
      feedItemAnimsRef.current[id] = new Animated.Value(
        hasPlayedFeedEntranceRef.current ? 1 : 0,
      );
    }
    return feedItemAnimsRef.current[id];
  }, []);

  const settleFeedItemAnims = useCallback((items: FeedItem[]) => {
    if (items.length === 0) {
      return;
    }

    if (hasPlayedFeedEntranceRef.current) {
      items.forEach(item => getFeedItemAnim(item.id).setValue(1));
      return;
    }

    const anims = items.map(item => {
      const anim = getFeedItemAnim(item.id);
      anim.setValue(0);
      return anim;
    });

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
    ).start(() => {
      hasPlayedFeedEntranceRef.current = true;
    });
  }, [getFeedItemAnim]);

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
      const alertStatus = advancedFilters?.alertStatus ?? 'All';
      const audioResults = await searchAudio(token, {
        limit: 100,
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

      const filteredResults =
        alertStatus === 'Flagged'
          ? audioResults.filter(item => item.hasWarning)
          : audioResults;

      setFeedItems(filteredResults);
      setCounties(prev => {
        const fromFeed = deriveCountiesFromFeed(filteredResults);
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
      settleFeedItemAnims(filteredResults);
    } catch (error) {
      setFeedError(
        error instanceof ApiError ? error.message : 'Unable to load feed.',
      );
    } finally {
      setLoadingFeed(false);
    }
  }, [advancedFilters, token, debouncedSearchQuery, settleFeedItemAnims]);

  useEffect(() => {
    loadCounties();
  }, [loadCounties]);

  useEffect(() => {
    if (!filtersReady) {
      return;
    }
    loadFeed();
  }, [loadFeed, filtersReady]);

  useEffect(() => {
    if (counties.length === 0) {
      return;
    }

    if (hasPlayedCountiesEntranceRef.current) {
      listEntranceAnim.setValue(1);
      cardFades.current.forEach(fade => fade.setValue(1));
      cardSlides.current.forEach(slide => slide.setValue(0));
      return;
    }

    hasPlayedCountiesEntranceRef.current = true;

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

  const sheetAppliedFilters = advancedFiltersToSheet(advancedFilters);

  const feedListKey = `${feedItems.map(item => item.id).join(',')}:${expandedPanel?.id ?? ''}:${expandedPanel?.type ?? ''}`;

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

  const mergeCountyFromFeedItem = useCallback((item: FeedItem) => {
    setCounties(prev => {
      const fromFeed = deriveCountiesFromFeed([item]);
      if (fromFeed.length === 0) {
        return prev;
      }
      const map = new Map<string, County>();
      [...prev, ...fromFeed].forEach(county => {
        const key = county.id ?? county.name;
        map.set(key, county);
      });
      const merged = Array.from(map.values());
      cardFades.current = merged.map(
        (_, index) => cardFades.current[index] ?? new Animated.Value(1),
      );
      cardSlides.current = merged.map(
        (_, index) => cardSlides.current[index] ?? new Animated.Value(0),
      );
      return merged;
    });
  }, []);

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
      mergeCountyFromFeedItem(item);
      animateLiveFeedItem(item.id);
    },
    [animateLiveFeedItem, mergeCountyFromFeedItem],
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
    mergeCountyFromFeedItem(item);
  }, [mergeCountyFromFeedItem]);

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

  const renderFeedItem = ({ item }: { item: FeedItem }) => (
    <FeedListItem
      item={item}
      entranceAnim={getFeedItemAnim(item.id)}
      onToggleStar={handleToggleStar}
      onPress={handleFeedPress}
      expandedPanel={expandedPanel}
      onToggleNotes={handleToggleNotes}
      onToggleMetadata={handleToggleMetadata}
      token={token}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
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

        <FlatList
          style={styles.feedList}
          data={feedItems}
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
            loadingFeed ? (
              <View style={styles.feedLoading}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
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
