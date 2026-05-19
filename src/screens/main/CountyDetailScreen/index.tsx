import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
} from 'react-native';
import { styles } from './styles';
import LinearGradient from 'react-native-linear-gradient';
import { glass, images } from '../../../constants';
import AdvancedFiltersBottomSheet from '../../../components/AdvancedFiltersBottomSheet';

type Props = {
  county: { name: string; code: string; est: string };
  onBack: () => void;
};

const mockTranscripts = [
  {
    id: '1',
    timestamp: '05/14/2026',
    time: '04:09:47',
    talkgroup: 'AFD Location',
    talkgroupId: '1147',
    snippet: 'Engine 1\' fire alar...',
    starred: false,
  },
  {
    id: '2',
    timestamp: '05/14/2026',
    time: '00:49:25',
    talkgroup: 'F-TAC 201',
    talkgroupId: '1371',
    snippet: 'I was jus gonna g...',
    starred: true,
  },
  {
    id: '3',
    timestamp: '05/14/2026',
    time: '00:11:30',
    talkgroup: 'AFD Location',
    talkgroupId: '1147',
    snippet: '34',
    starred: false,
  },
];

const CountyDetailScreen = ({ county, onBack }: Props) => {
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Animation values
  const fadeAnims = useRef(mockTranscripts.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(mockTranscripts.map(() => new Animated.Value(20))).current;
  const statsAnims = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const statsSlideAnims = useRef([new Animated.Value(30), new Animated.Value(30), new Animated.Value(30)]).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset and start animations
    headerOpacity.setValue(0);
    statsAnims.forEach(anim => anim.setValue(0));
    statsSlideAnims.forEach(anim => anim.setValue(30));
    fadeAnims.forEach(anim => anim.setValue(0));
    slideAnims.forEach(anim => anim.setValue(20));

    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(100, [
        ...statsAnims.map((anim, i) =>
          Animated.parallel([
            Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(statsSlideAnims[i], { toValue: 0, duration: 400, useNativeDriver: true })
          ])
        ),
        ...fadeAnims.map((anim, i) =>
          Animated.parallel([
            Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(slideAnims[i], { toValue: 0, duration: 300, useNativeDriver: true })
          ])
        ),
      ])
    ]).start();
  }, [county.name]);

  const renderTranscriptItem = ({ item, index }: { item: typeof mockTranscripts[0], index: number }) => (
    <Animated.View
      key={item.id}
      style={[styles.tableRow, {
        opacity: fadeAnims[index],
        transform: [{ translateY: slideAnims[index] }]
      }]}
    >
      <TouchableOpacity style={styles.starColumn}>
        <Text style={styles.starIcon}>{item.starred ? '★' : '☆'}</Text>
      </TouchableOpacity>
      <View style={styles.timestampColumn}>
        <Text style={styles.cellText}>{item.timestamp}</Text>
        <Text style={styles.cellTime}>{item.time}</Text>
      </View>
      <View style={styles.talkgroupColumn}>
        <Text style={styles.cellText}>{item.talkgroup}</Text>
        <Text style={styles.cellMeta}>ID: {item.talkgroupId}</Text>
      </View>
      <View style={styles.snippetColumn}>
        <Text style={styles.cellText} numberOfLines={2}>
          {item.snippet}
        </Text>
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
      {/* Top Header */}
      <Animated.View style={[styles.topHeader, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Image source={images.previous} style={styles.backIconImage} />
          <Text style={styles.topTitle}>{county.name}</Text>
        </TouchableOpacity>
        <View style={styles.topRightContainer}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE FEED</Text>
          </View>
          <TouchableOpacity style={styles.filterHeaderButton}
            onPress={() => {
              console.log('Opening filters...');
              setFilterSheetVisible(true);
            }}
          >
            <Image source={images.filter} style={styles.filterIcon} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Breadcrumb */}
      <Animated.View style={[styles.breadcrumb, { opacity: headerOpacity }]}>
        <Image source={images.home} style={styles.breadcrumbHomeIcon} />
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbText}>Counties</Text>
        <Text style={styles.breadcrumbSeparator}>›</Text>
        <Text style={styles.breadcrumbActive}>{county.name}</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Animated.View style={[styles.statCard, { opacity: statsAnims[0], transform: [{ translateY: statsSlideAnims[0] }] }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>ACTIVE ALERTS</Text>
            </View>
            <Text style={styles.statValue}>04</Text>
            <Image source={images.danger} style={styles.statIconImage} />
          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: statsAnims[1], transform: [{ translateY: statsSlideAnims[1] }] }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>TALKGROUPS</Text>
            </View>
            <Text style={[styles.statValue, { color: "#9BB0DB" }]}>112</Text>
            <Image source={images.radio} style={styles.statIconImage} />

          </Animated.View>

          <Animated.View style={[styles.statCard, { opacity: statsAnims[2], transform: [{ translateY: statsSlideAnims[2] }] }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>SIGNAL STRENGTH</Text>
            </View>
            <Text style={styles.statValueGreen}>-84 dBm</Text>
            <Image source={images.signal} style={styles.statIconImage} />

          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, { opacity: headerOpacity }]}>
          <TouchableOpacity style={styles.resumeButton}>
            <Text style={styles.resumeButtonIcon}>⊳</Text>
            <Text style={styles.resumeButtonText}>RESUME FEED</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoritesButton}>
            <Text style={styles.favoritesButtonIcon}>✓</Text>
            <Text style={styles.favoritesButtonText}>FAVORITES (12)</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Records Info */}
        <Animated.View style={[styles.recordsInfo, { opacity: headerOpacity }]}>
          <Text style={styles.recordsText}>
            Showing <Text style={styles.recordsBold}>1,088 records</Text> •{' '}
            <Text style={styles.resetLink}>Reset</Text>
          </Text>
        </Animated.View>

        {/* Table Header */}
        <Animated.View style={[styles.tableHeader, { opacity: headerOpacity }]}>
          <View style={styles.starColumn}>
            <Text style={styles.headerText} />
          </View>
          <View style={styles.timestampColumn}>
            <Text style={styles.headerText}>TIMESTAMP</Text>
          </View>
          <View style={styles.talkgroupColumn}>
            <Text style={styles.headerText}>TALKGROUP</Text>
          </View>
          <View style={styles.snippetColumn}>
            <Text style={styles.headerText}>TRANSCRIPT SNIPPET</Text>
          </View>
        </Animated.View>

        {/* Transcript List */}
        {mockTranscripts.map((item, index) => renderTranscriptItem({ item, index }))}
      </ScrollView>

      <AdvancedFiltersBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={(filters) => {
          console.log('Filters applied:', filters);
        }}
      />
    </LinearGradient>
  );
};

export default CountyDetailScreen;
