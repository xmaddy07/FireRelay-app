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
import { styles } from './styles';
import Header from '../../../components/Header';
import CountyDetailScreen from '../CountyDetailScreen';
import AdvancedFiltersBottomSheet from '../../../components/AdvancedFiltersBottomSheet';
import LinearGradient from 'react-native-linear-gradient';
import { glass, images } from '../../../constants';

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
  county: string;
  feedType: string;
  keywordPriority: string;
  keywords: string;
  talkgroup: string;
  talkgroupId: string;
  fromDate: string;
  toDate: string;
};

type County = { name: string; code: string; est: string };

type FeedItem = {
  id: string;
  county: string;
  talkgroup: string;
  talkgroupId: string;
  time: string;
  snippet: string;
  type: 'fire' | 'medical' | 'police' | 'general';
  severity: 'critical' | 'warning' | 'info';
  starred: boolean;
};

const PRIORITY_SEVERITY: Record<string, FeedItem['severity']> = {
  High: 'critical',
  Medium: 'warning',
  Low: 'info',
};

const matchesFeedFilters = (item: FeedItem, filters: AdvancedFeedFilters): boolean => {
  if (filters.county && item.county !== filters.county) {
    return false;
  }
  if (filters.feedType !== 'All' && item.type !== filters.feedType.toLowerCase()) {
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
    if (!inSnippet && !inTalkgroup) {
      return false;
    }
  }
  if (
    filters.talkgroup &&
    !item.talkgroup.toLowerCase().includes(filters.talkgroup.toLowerCase())
  ) {
    return false;
  }
  if (filters.talkgroupId && item.talkgroupId !== filters.talkgroupId) {
    return false;
  }
  return true;
};

const isFeedFiltersEmpty = (filters: {
  county: string;
  feedType: string;
  keywordPriority: string;
  fromDate: string;
  toDate: string;
  keywords: string;
  talkgroup: string;
  talkgroupId: string;
}) =>
  !filters.county &&
  filters.feedType === 'All' &&
  filters.keywordPriority === 'All' &&
  !filters.fromDate &&
  !filters.toDate &&
  !filters.keywords &&
  !filters.talkgroup &&
  !filters.talkgroupId;

const counties: County[] = [
  { name: 'Travis', code: 'TX-TRA', est: '1840' },
  { name: 'Wilco', code: 'TX-WIL', est: '1848' },
  { name: 'McLennan', code: 'TX-MCL', est: '1850' },
];

const mockFeedItems: FeedItem[] = [
  {
    id: 'f1',
    county: 'Travis',
    talkgroup: 'AFD Dispatch',
    talkgroupId: '1147',
    time: '04:12:35',
    snippet: 'Engine 1 responding to automatic fire alarm at 123 Main St. Smoke reported on third floor.',
    type: 'fire',
    severity: 'warning',
    starred: false,
  },
  {
    id: 'f2',
    county: 'Wilco',
    talkgroup: 'WCSO Dispatch',
    talkgroupId: '2214',
    time: '04:09:47',
    snippet: 'Medic 4 on scene of a 2-vehicle collision, requesting backup for traffic control.',
    type: 'medical',
    severity: 'warning',
    starred: true,
  },
  {
    id: 'f3',
    county: 'Travis',
    talkgroup: 'ATCEMS Dispatch',
    talkgroupId: '1052',
    time: '04:05:12',
    snippet: 'Ambulance 12 dispatched for high-priority medical emergency. CPR in progress.',
    type: 'medical',
    severity: 'critical',
    starred: false,
  },
  {
    id: 'f4',
    county: 'McLennan',
    talkgroup: 'Waco PD North',
    talkgroupId: '3401',
    time: '03:58:22',
    snippet: 'Unit 204 in pursuit of a black sedan heading north on I-35. Speeds exceeding 90mph.',
    type: 'police',
    severity: 'critical',
    starred: false,
  },
  {
    id: 'f5',
    county: 'Wilco',
    talkgroup: 'Round Rock FD',
    talkgroupId: '2411',
    time: '03:49:15',
    snippet: 'Truck 3 assisting with power line down on Palm Valley Blvd. Area secured.',
    type: 'fire',
    severity: 'info',
    starred: false,
  },
  {
    id: 'f6',
    county: 'McLennan',
    talkgroup: 'MCSO Dispatch',
    talkgroupId: '3120',
    time: '03:30:45',
    snippet: 'Routine patrol completed around Hewitt area. No anomalies detected.',
    type: 'police',
    severity: 'info',
    starred: false,
  },
];

type Props = {
  onNotificationPress?: () => void;
};

const LivePulseDot = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });
  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0],
  });
  const dotScale = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });
  const dotOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.75, 1],
  });

  return (
    <View style={styles.livePulseWrapper}>
      <Animated.View
        style={[
          styles.livePulseRing,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.livePulseDot,
          { opacity: dotOpacity, transform: [{ scale: dotScale }] },
        ]}
      />
    </View>
  );
};

const CountyCard = ({
  county,
  fadeAnim,
  slideAnim,
  onPress,
}: {
  county: County;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onPress: () => void;
}) => {
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
        <View style={styles.horizontalCardCompact}>
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

const AnimatedAlertFeedCard = ({
  severity,
  children,
}: {
  severity: 'critical' | 'warning';
  children: React.ReactNode;
}) => {
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
        <View style={styles.feedItemBadgeContainer}>
          <View style={[styles.feedBadge, badgeStyle]}>
            <Text style={[styles.feedBadgeText, badgeTextStyle]}>{badgeLabel}</Text>
          </View>
          <Text style={styles.feedCountyText}>{item.county.toUpperCase()} COUNTY</Text>
        </View>
        <Text style={styles.feedTimeText}>{item.time}</Text>
      </View>

      <Text style={styles.feedTalkgroupText}>{item.talkgroup} (ID: {item.talkgroupId})</Text>
      <Text style={styles.feedSnippetText}>{item.snippet}</Text>

      <View style={styles.feedItemFooter}>
        <TouchableOpacity
          onPress={() => onToggleStar(item.id)}
          style={styles.feedStarButton}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.feedStarIcon,
            item.starred ? styles.feedStarIconActive : styles.feedStarIconInactive,
          ]}>
            {item.starred ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.feedMetaText}>
          {item.severity.toUpperCase()} • SECURED
        </Text>
      </View>
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
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const transitionAnim = useRef(new Animated.Value(0)).current;

  // Live Feed State
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

  const handleSelectCounty = (county: County) => {
    setSelectedCounty(county);
    setIsDetailVisible(true);
    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    Animated.timing(transitionAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDetailVisible(false);
      setSelectedCounty(null);
    });
  };

  const handleToggleStar = (itemId: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, starred: !item.starred } : item
      )
    );
  };

  const hasAdvancedFilters = advancedFilters !== null;

  const filteredFeed = advancedFilters
    ? feedItems.filter(item => matchesFeedFilters(item, advancedFilters))
    : feedItems;

  const feedListKey = filteredFeed.map(item => item.id).join(',');

  useEffect(() => {
    if (!hasMountedRef.current) return;
    animateFeedList(filteredFeed);
  }, [feedListKey]);

  const listOpacity = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const listTranslateX = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -50],
  });

  const detailOpacity = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const detailTranslateX = transitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const renderFeedItem = ({ item }: { item: FeedItem }) => (
    <FeedListItem
      item={item}
      entranceAnim={getFeedItemAnim(item.id)}
      onToggleStar={handleToggleStar}
    />
  );

  const renderCountiesStrip = () => (
    <Animated.View style={{ opacity: listEntranceAnim }}>
      <View style={styles.sectionHeaderCompact}>
        <Text style={styles.sectionTitleCompact}>Counties</Text>
        <View style={styles.countBadgeCompact}>
          <Text style={styles.countBadgeTextCompact}>{counties.length} ACTIVE</Text>
        </View>
      </View>
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
            onPress={() => handleSelectCounty(county)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderFeedSection = () => (
    <Animated.View style={[styles.feedSection, { opacity: listEntranceAnim }]}>
      <View style={styles.feedSectionHeader}>
        <View style={styles.feedTitleRow}>
          <LivePulseDot />
          <Text style={styles.feedSectionTitle}>Live Feed</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterIconButton, hasAdvancedFilters && styles.filterIconButtonActive]}
          onPress={() => setFilterSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Image source={images.filter} style={styles.filterIcon} resizeMode="contain" />
        </TouchableOpacity>
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
      <Animated.View style={[StyleSheet.absoluteFill, styles.screenBody, {
        opacity: listOpacity,
        transform: [{ translateX: listTranslateX }],
        zIndex: isDetailVisible ? 0 : 1,
      }]}>
        <Animated.View style={{ opacity: listEntranceAnim }}>
          <Header
            title="Live Feed"
            onNotificationPress={onNotificationPress}
            showNotification={true}
          />
        </Animated.View>

        {renderCountiesStrip()}
        {renderFeedSection()}

        <FlatList
          style={styles.feedList}
          data={filteredFeed}
          renderItem={renderFeedItem}
          keyExtractor={item => item.id}
          extraData={feedListKey}
          contentContainerStyle={styles.feedListContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {(isDetailVisible || selectedCounty) && (
        <Animated.View style={[StyleSheet.absoluteFill, {
          opacity: detailOpacity,
          transform: [{ translateX: detailTranslateX }],
          zIndex: isDetailVisible ? 1 : 0,
        }]}>
          {selectedCounty && (
            <CountyDetailScreen
              county={selectedCounty}
              onBack={handleBack}
            />
          )}
        </Animated.View>
      )}

      <AdvancedFiltersBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={filters => {
          if (isFeedFiltersEmpty(filters)) {
            setAdvancedFilters(null);
            return;
          }

          setAdvancedFilters({
            county: filters.county,
            feedType: filters.feedType,
            keywordPriority: filters.keywordPriority,
            keywords: filters.keywords,
            talkgroup: filters.talkgroup,
            talkgroupId: filters.talkgroupId,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
          });
        }}
      />
    </LinearGradient>
  );
};

export default CountiesScreen;
