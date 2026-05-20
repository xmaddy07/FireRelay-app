import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { createStyles } from './styles';
import { useTheme, useThemedStyles } from '../../../theme';
import Header from '../../../components/Header';
import AdvancedFiltersBottomSheet, {
  FilterState as SheetFilterState,
} from '../../../components/AdvancedFiltersBottomSheet';
import LinearGradient from 'react-native-linear-gradient';
import {images} from '../../../constants';
import { responsiveHitSlop } from '../../../utils/responsive';

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

type County = { name: string; code: string; est: string };

type FeedItem = {
  id: string;
  county: string;
  talkgroup: string;
  talkgroupId: string;
  date: string;
  time: string;
  snippet: string;
  highlightKeywords: string[];
  type: 'fire' | 'medical' | 'police' | 'general';
  severity: 'critical' | 'warning' | 'info';
  starred: boolean;
  hasWarning: boolean;
  hasSecure: boolean;
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

const counties: County[] = [
  { name: 'Travis', code: 'TX-TRA', est: '1840' },
  { name: 'Wilco', code: 'TX-WIL', est: '1848' },
  { name: 'McLennan', code: 'TX-MCL', est: '1850' },
];

const mockFeedItems: FeedItem[] = [
  {
    id: 'f1',
    county: 'Travis',
    talkgroup: 'F-COM E. F-COM W.',
    talkgroupId: '1122 1142',
    date: '05/20/2026',
    time: '05:22:29',
    snippet:
      'From the structure fire, the first due Engine 7 and arriving unit B1 from the area is still attempting to initiate fire suppression ops. We\'re still having problems with the broken water line but we\'re going to try and fight this fire with what we have.',
    highlightKeywords: ['structure fire', 'broken water'],
    type: 'fire',
    severity: 'critical',
    starred: false,
    hasWarning: true,
    hasSecure: true,
  },
  {
    id: 'f2',
    county: 'Travis',
    talkgroup: 'F-COM W. F-COM E.',
    talkgroupId: '1122 1142',
    date: '05/20/2026',
    time: '05:18:10',
    snippet:
      'Pulling a rear third line. Scene secure. We have knocked out the fire and our heavy rescue in line 29 is going to be the only unit on scene for a while.',
    highlightKeywords: [],
    type: 'fire',
    severity: 'info',
    starred: false,
    hasWarning: true,
    hasSecure: true,
  },
  {
    id: 'f3',
    county: 'Travis',
    talkgroup: 'AFD Locution',
    talkgroupId: '1147',
    date: '05/20/2026',
    time: '05:17:46',
    snippet:
      'Engine 23 broken water pipe at 4500 block of Burnet Road. Requesting water department and additional engine company for traffic control.',
    highlightKeywords: ['broken water'],
    type: 'fire',
    severity: 'warning',
    starred: true,
    hasWarning: true,
    hasSecure: true,
  },
  {
    id: 'f4',
    county: 'Travis',
    talkgroup: 'AFD Location',
    talkgroupId: '1147',
    date: '05/20/2026',
    time: '05:22:29',
    snippet:
      'Medic 4 on scene of a 2-vehicle collision requesting backup for traffic control on I-35 frontage road.',
    highlightKeywords: [],
    type: 'medical',
    severity: 'warning',
    starred: false,
    hasWarning: true,
    hasSecure: true,
  },
  {
    id: 'f5',
    county: 'Wilco',
    talkgroup: 'WCSO Dispatch',
    talkgroupId: '2214',
    date: '05/20/2026',
    time: '05:17:46',
    snippet:
      'Engine 23 broken water pipe at 4500 block of Burnet Road. Requesting water department response.',
    highlightKeywords: ['broken water'],
    type: 'fire',
    severity: 'warning',
    starred: false,
    hasWarning: true,
    hasSecure: true,
  },
  {
    id: 'f6',
    county: 'Travis',
    talkgroup: 'F-COM E. F-COM W.',
    talkgroupId: '1122 1142',
    date: '05/20/2026',
    time: '05:14:02',
    snippet:
      'Command advising all units the structure fire is now under control. Rehab sector established on the B side.',
    highlightKeywords: ['structure fire'],
    type: 'fire',
    severity: 'info',
    starred: true,
    hasWarning: true,
    hasSecure: true,
  },
];

type Props = {
  onNotificationPress?: () => void;
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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const FEED_SNIPPET_MAX_LINES = 2;

const FeedSnippetText = ({
  snippet,
  highlightKeywords,
}: {
  snippet: string;
  highlightKeywords: string[];
}) => {
  const styles = useThemedStyles(createStyles);
  const snippetProps = {
    style: styles.feedSnippetText,
    numberOfLines: FEED_SNIPPET_MAX_LINES,
    ellipsizeMode: 'tail' as const,
  };

  if (highlightKeywords.length === 0) {
    return <Text {...snippetProps}>{snippet}</Text>;
  }

  const pattern = new RegExp(
    `(${highlightKeywords.map(escapeRegExp).join('|')})`,
    'gi',
  );
  const parts = snippet.split(pattern).filter(part => part.length > 0);

  return (
    <Text {...snippetProps}>
      {parts.map((part, index) => {
        const isHighlight = highlightKeywords.some(
          keyword => keyword.toLowerCase() === part.toLowerCase(),
        );

        if (isHighlight) {
          return (
            <Text key={`${part}-${index}`} style={styles.feedSnippetHighlight}>
              {part}
            </Text>
          );
        }

        return <Text key={`${part}-${index}`}>{part}</Text>;
      })}
    </Text>
  );
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
}: {
  item: FeedItem;
  entranceAnim: Animated.Value;
  onToggleStar: (id: string) => void;
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
            {item.county.toUpperCase()} COUNTY
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
      />
    </>
  );

  return (
    <Animated.View style={slideStyle}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
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

const CountiesScreen = ({ onNotificationPress }: Props) => {
  const {colors, glass} = useTheme();
  const styles = useThemedStyles(createStyles);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(mockFeedItems);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFeedFilters | null>(null);

  // Entrance animations
  const listEntranceAnim = useRef(new Animated.Value(0)).current;
  const cardFades = useRef(counties.map(() => new Animated.Value(0))).current;
  const cardSlides = useRef(counties.map(() => new Animated.Value(24))).current;
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

  useEffect(() => {
    Animated.sequence([
      Animated.timing(listEntranceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(
        90,
        cardFades.map((fade, i) =>
          Animated.parallel([
            Animated.spring(fade, {
              toValue: 1,
              friction: 7,
              tension: 60,
              useNativeDriver: true,
            }),
            Animated.spring(cardSlides[i], {
              toValue: 0,
              friction: 7,
              tension: 60,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    ]).start(() => {
      animateFeedList(mockFeedItems);
      hasMountedRef.current = true;
    });
  }, []);

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

  const handleToggleStar = (itemId: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, starred: !item.starred } : item
      )
    );
  };

  const hasAdvancedFilters =
    advancedFilters !== null && !isFeedFiltersEmpty(advancedFilters);

  const selectedCountyNames = advancedFilters?.counties ?? [];

  const filteredFeed = advancedFilters
    ? feedItems.filter(item => matchesFeedFilters(item, advancedFilters))
    : feedItems;

  const sheetAppliedFilters = advancedFiltersToSheet(advancedFilters);

  const feedListKey = filteredFeed.map(item => item.id).join(',');

  useEffect(() => {
    if (!hasMountedRef.current) return;
    animateFeedList(filteredFeed);
  }, [feedListKey]);

  const renderFeedItem = ({ item }: { item: FeedItem }) => (
    <FeedListItem
      item={item}
      entranceAnim={getFeedItemAnim(item.id)}
      onToggleStar={handleToggleStar}
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
            key={county.name}
            county={county}
            fadeAnim={cardFades[index]}
            slideAnim={cardSlides[index]}
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
        <Animated.View style={{ opacity: listEntranceAnim }}>
          <Header
            title="Live Feed"
            showFilter
            filterActive={hasAdvancedFilters}
            onFilterPress={() => setFilterSheetVisible(true)}
            onNotificationPress={onNotificationPress}
            showNotification
          />
        </Animated.View>

        {renderCountiesStrip()}

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
        />
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
    </LinearGradient>
  );
};

export default CountiesScreen;
