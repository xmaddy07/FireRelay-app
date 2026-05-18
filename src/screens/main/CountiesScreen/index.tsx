import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { styles } from './styles';
import Header from '../../../components/Header';
import CountyDetailScreen from '../CountyDetailScreen';
import LinearGradient from 'react-native-linear-gradient';
import { images } from '../../../constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { hp } from '../../../utils/responsive';

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
  onOpenDrawer?: () => void;
  onNotificationPress?: () => void;
};

const CountiesScreen = ({ onOpenDrawer, onNotificationPress }: Props) => {
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const transitionAnim = useRef(new Animated.Value(0)).current;

  // Live Feed State
  const [feedItems, setFeedItems] = useState<FeedItem[]>(mockFeedItems);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Fire' | 'Medical' | 'Police'>('All');

  // Entrance animations
  const listEntranceAnim = useRef(new Animated.Value(0)).current;
  const cardFades = useRef(counties.map(() => new Animated.Value(0))).current;
  const cardSlides = useRef(counties.map(() => new Animated.Value(20))).current;

  useEffect(() => {
    // Initial entrance sequence
    Animated.sequence([
      Animated.timing(listEntranceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(100, [
        ...cardFades.map((fade, i) =>
          Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(cardSlides[i], { toValue: 0, duration: 400, useNativeDriver: true })
          ])
        )
      ])
    ]).start();
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

  const filteredFeed = feedItems.filter(item => {
    if (selectedFilter === 'All') return true;
    return item.type.toLowerCase() === selectedFilter.toLowerCase();
  });

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

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
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

    return (
      <View style={styles.feedItemCard}>
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
            onPress={() => handleToggleStar(item.id)}
            style={styles.feedStarButton}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.feedStarIcon,
              item.starred ? styles.feedStarIconActive : styles.feedStarIconInactive
            ]}>
              {item.starred ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.feedMetaText}>
            {item.severity.toUpperCase()} • SECURED
          </Text>
        </View>
      </View>
    );
  };

  const renderListHeader = () => (
    <View>
      {/* Counties Section Title */}
      <Animated.View style={{ opacity: listEntranceAnim }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Counties</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{counties.length} ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.sectionCaption}>TAP A COUNTY TO VIEW LIVE DISPATCH DETAILS</Text>
      </Animated.View>

      {/* Counties Horizontal Scroll */}
      <View style={styles.countiesHorizontalContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {counties.map((county, index) => (
            <TouchableOpacity
              key={county.name}
              onPress={() => handleSelectCounty(county)}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.horizontalCard, {
                opacity: cardFades[index],
                transform: [{ translateY: cardSlides[index] }]
              }]}>
                <View style={styles.horizontalCardHeader}>
                  <View style={styles.horizontalCardIconWrapper}>
                    <Image source={images.map} style={styles.horizontalCardIconImage as any} />
                  </View>
                  <View style={styles.dotWrapper}>
                    <View style={styles.dot} />
                  </View>
                </View>
                <View style={styles.horizontalCardContent}>
                  <Text style={styles.horizontalCardTitle}>{county.name}</Text>
                  <Text style={styles.horizontalCardMeta}>{county.code} | EST. {county.est}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed Section Title */}
      <Animated.View style={[styles.feedHeaderRow, { opacity: listEntranceAnim }]}>
        <View style={styles.feedTitleContainer}>
          <View style={styles.livePulseDot} />
          <Text style={styles.feedTitle}>Live Feed</Text>
        </View>
        <Text style={styles.feedSubtitle}>REAL-TIME ALERTS</Text>
      </Animated.View>

      {/* Category Chips */}
      <Animated.View style={{ opacity: listEntranceAnim }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {(['All', 'Fire', 'Medical', 'Police'] as const).map(filter => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {filter.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );



  return (
    <LinearGradient
      colors={['#05070A', '#0B1220', '#1A0F08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[StyleSheet.absoluteFill, {
        opacity: listOpacity,
        transform: [{ translateX: listTranslateX }],
        zIndex: isDetailVisible ? 0 : 1,
      }]}>
        <Animated.View style={{ opacity: listEntranceAnim }}>
          <Header title="Live Feed" onMenuPress={onOpenDrawer} onNotificationPress={onNotificationPress} />
        </Animated.View>

        <FlatList
          data={filteredFeed}
          renderItem={renderFeedItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.content}
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
    </LinearGradient>
  );
};

export default CountiesScreen;
