import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
  Alert,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {images} from '../../../config/constants';
import {useOpenNotifications} from '../../../navigation/hooks';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {
  hp,
  responsiveHitSlop,
  wp,
} from '../../../utils/responsive';
import {
  createPremium,
  createStyles,
  TAB_BAR_HEIGHT,
} from './styles';
import KeywordFormModal from './KeywordFormModal';
import type {KeywordRecord} from './types';

const INITIAL_KEYWORDS: KeywordRecord[] = [
  {
    id: '1',
    name: 'a lot of smoke',
    active: true,
    description: 'medium',
    descriptionLevel: 'normal',
    createdAt: '2025-09-21',
  },
  {
    id: '2',
    name: 'attic fire',
    active: true,
    description: 'CRITICAL',
    descriptionLevel: 'critical',
    createdAt: '2025-09-21',
    isCritical: true,
  },
  {
    id: '3',
    name: 'bell',
    active: false,
    description: 'negative',
    descriptionLevel: 'normal',
    createdAt: '2025-09-18',
  },
];

const formatCreatedDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
};

type KeywordListItemProps = {
  item: KeywordRecord;
  entranceAnim: Animated.Value;
  onEdit: (keyword: KeywordRecord) => void;
  onDelete: (keyword: KeywordRecord) => void;
};

const KeywordListItem = ({
  item,
  entranceAnim,
  onEdit,
  onDelete,
}: KeywordListItemProps) => {
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isCritical = item.isCritical || item.descriptionLevel === 'critical';

  const entranceStyle = {
    opacity: entranceAnim,
    transform: [
      {
        translateY: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
      {scale: scaleAnim},
    ],
  };

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

  return (
    <Animated.View style={entranceStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.keywordCard, isCritical && styles.keywordCardCritical]}
      >
        {isCritical ? <View style={styles.criticalAccent} /> : null}
        <View style={styles.keywordCardBody}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.keywordName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(item)}
                activeOpacity={0.75}
                hitSlop={responsiveHitSlop(1.6)}
              >
                <Icon name="edit-2" size={15} color="#60A5FA" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={() => onDelete(item)}
                activeOpacity={0.75}
                hitSlop={responsiveHitSlop(1.6)}
              >
                <Icon name="trash-2" size={15} color="#F87171" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                item.active
                  ? styles.statusDotActive
                  : styles.statusDotInactive,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                item.active
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {item.active ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Description</Text>
              <Text
                style={[
                  styles.metaValue,
                  isCritical && styles.metaValueCritical,
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            </View>
            <View style={[styles.metaColumn,{alignItems:'flex-end'}]}>
              <Text style={styles.metaLabel}>Created</Text>
              <Text
                style={[styles.metaValue, styles.metaValueMono]}
                numberOfLines={1}
              >
                {formatCreatedDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const KeywordsScreen = () => {
  const openNotifications = useOpenNotifications();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const premium = useMemo(() => createPremium(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [keywords, setKeywords] = useState<KeywordRecord[]>(INITIAL_KEYWORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<KeywordRecord | null>(
    null,
  );

  const listBottomInset = insets.bottom + TAB_BAR_HEIGHT + hp(2);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const addButtonAnim = useRef(new Animated.Value(0)).current;
  const addButtonPulse = useRef(new Animated.Value(0)).current;
  const addButtonPress = useRef(new Animated.Value(1)).current;
  const itemAnimsRef = useRef<Record<string, Animated.Value>>({});

  const filteredKeywords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return keywords;
    }
    return keywords.filter(
      keyword =>
        keyword.name.toLowerCase().includes(query) ||
        keyword.description.toLowerCase().includes(query),
    );
  }, [keywords, searchQuery]);

  const getItemAnim = (id: string) => {
    if (!itemAnimsRef.current[id]) {
      itemAnimsRef.current[id] = new Animated.Value(0);
    }
    return itemAnimsRef.current[id];
  };

  const animateKeywordList = (items: KeywordRecord[]) => {
    const anims = items.map(item => {
      const anim = getItemAnim(item.id);
      anim.setValue(0);
      return anim;
    });
    if (anims.length === 0) {
      return;
    }
    Animated.stagger(
      70,
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
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(120),
        Animated.spring(searchAnim, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.spring(addButtonAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(addButtonPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(addButtonPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [headerAnim, searchAnim, addButtonAnim, addButtonPulse]);

  useEffect(() => {
    animateKeywordList(filteredKeywords);
  }, [filteredKeywords]);

  const handleEdit = (keyword: KeywordRecord) => {
    setEditingKeyword(keyword);
    setEditModalVisible(true);
  };

  const handleDelete = (keyword: KeywordRecord) => {
    Alert.alert('Delete Keyword', `Remove "${keyword.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setKeywords(prev => prev.filter(k => k.id !== keyword.id));
        },
      },
    ]);
  };

  const handleAddKeyword = () => {
    setAddModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingKeyword(null);
  };

  const handleCreateKeyword = (keyword: KeywordRecord) => {
    setKeywords(prev => [keyword, ...prev]);
  };

  const handleUpdateKeyword = (keyword: KeywordRecord) => {
    setKeywords(prev =>
      prev.map(item => (item.id === keyword.id ? keyword : item)),
    );
  };

  const handleFilterPress = () => {
    Alert.alert('Filters', 'Keyword filters — coming soon.');
  };

  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
    ],
  };

  const searchBarStyle = {
    opacity: searchAnim,
    transform: [
      {
        translateY: searchAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-14, 0],
        }),
      },
    ],
  };

  const addButtonStyle = {
    opacity: addButtonAnim,
    transform: [
      {
        scale: addButtonAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
      {scale: addButtonPress},
    ],
  };

  const addButtonRingStyle = {
    opacity: addButtonAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.85],
    }),
    transform: [
      {
        scale: addButtonPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.18],
        }),
      },
    ],
  };

  const handleAddButtonPressIn = () => {
    Animated.spring(addButtonPress, {
      toValue: 0.94,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleAddButtonPressOut = () => {
    Animated.spring(addButtonPress, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const renderKeywordCard = ({item}: {item: KeywordRecord}) => (
    <KeywordListItem
      item={item}
      entranceAnim={getItemAnim(item.id)}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <Animated.View style={[styles.screenHeader, headerStyle]}>
        <View style={styles.screenHeaderText}>
          <Text style={styles.screenTitle} numberOfLines={2}>
            {`Keywords ${'\n'}Management`}
          </Text>
          <Text style={styles.screenSubtitle}>Surveillance Core v4.2</Text>
        </View>
        <TouchableOpacity
          style={styles.headerNotificationButton}
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

      <Animated.View style={[styles.toolbarRow, searchBarStyle]}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={18}
            color={premium.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search keywords..."
            placeholderTextColor={premium.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterPress}
            activeOpacity={0.8}
            hitSlop={responsiveHitSlop(1.4)}
          >
            <Image
              source={images.filter}
              style={styles.filterIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.addButtonWrap, addButtonStyle]}>
          <Animated.View
            style={[styles.addButtonRing, addButtonRingStyle]}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.9}
            onPress={handleAddKeyword}
            onPressIn={handleAddButtonPressIn}
            onPressOut={handleAddButtonPressOut}
          >
            <Icon name="plus" size={22} color={colors.textOnPrimary} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        data={filteredKeywords}
        keyExtractor={item => item.id}
        renderItem={renderKeywordCard}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: listBottomInset},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={<View style={styles.listFooter} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No keywords match your search.
            </Text>
          </View>
        }
      />

      <KeywordFormModal
        visible={addModalVisible}
        mode="add"
        keyword={null}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleCreateKeyword}
      />

      <KeywordFormModal
        visible={editModalVisible}
        mode="edit"
        keyword={editingKeyword}
        onClose={closeEditModal}
        onSubmit={handleUpdateKeyword}
      />
    </View>
  );
};

export default KeywordsScreen;
