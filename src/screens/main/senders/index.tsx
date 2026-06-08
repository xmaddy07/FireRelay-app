import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
  Alert,
  Animated,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import {images} from '../../../config/constants';
import {useOpenNotifications} from '../../../navigation/hooks';
import type {MainTabParamList} from '../../../navigation/types';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {hp, responsiveHitSlop, wp} from '../../../utils/responsive';
import {createPremium, createStyles, TAB_BAR_HEIGHT} from './styles';
import {
  ApiError,
  createSender,
  deleteSender,
  getSenderById,
  listSenders,
  regenerateSenderToken,
  searchSenders,
  updateSender,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import SenderFormModal from './SenderFormModal';
import type {SenderRecord, SenderStatus, StatusFilter} from './types';
import {SENDERS_PAGE_SIZE, STATUS_FILTER_OPTIONS} from './types';

const formatCreatedDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const maskToken = (token: string) => {
  if (token.length <= 8) {
    return token;
  }
  return `${token.slice(0, 4)}........${token.slice(-4)}`;
};

const statusLabel = (status: SenderStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const filterToStatus = (filter: StatusFilter): SenderStatus | null => {
  if (filter === 'All Status') {
    return null;
  }
  return filter.toLowerCase() as SenderStatus;
};

type StatCardProps = {
  label: string;
  value: number;
  subLabel: string;
  icon: string;
  iconStyle: 'blue' | 'green' | 'orange' | 'red';
  iconColor: string;
};

type SenderListItemProps = {
  item: SenderRecord;
  entranceAnim: Animated.Value;
  editLoading: boolean;
  onRegenerate: (sender: SenderRecord) => void;
  onEdit: (sender: SenderRecord) => void;
  onDelete: (sender: SenderRecord) => void;
  onCopyToken: (token: string) => void;
};

const StatCard = ({
  label,
  value,
  subLabel,
  icon,
  iconStyle,
  iconColor,
}: StatCardProps) => {
  const styles = useThemedStyles(createStyles);
  const iconWrapStyle = {
    blue: styles.statIconBlue,
    green: styles.statIconGreen,
    orange: styles.statIconOrange,
    red: styles.statIconRed,
  }[iconStyle];

  return (
    <View style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconWrap, iconWrapStyle]}>
          <Icon name={icon} size={16} color={iconColor} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubLabel}>{subLabel}</Text>
    </View>
  );
};

const SenderListItem = ({
  item,
  entranceAnim,
  editLoading,
  onRegenerate,
  onEdit,
  onDelete,
  onCopyToken,
}: SenderListItemProps) => {
  const styles = useThemedStyles(createStyles);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const badgeStyle = {
    active: styles.statusBadgeActive,
    inactive: styles.statusBadgeInactive,
    disabled: styles.statusBadgeDisabled,
  }[item.status];

  const dotStyle = {
    active: styles.statusBadgeDotActive,
    inactive: styles.statusBadgeDotInactive,
    disabled: styles.statusBadgeDotDisabled,
  }[item.status];

  const textStyle = {
    active: styles.statusBadgeTextActive,
    inactive: styles.statusBadgeTextInactive,
    disabled: styles.statusBadgeTextDisabled,
  }[item.status];

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
        style={styles.senderCard}
      >
        <View style={styles.senderCardBody}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.senderName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={[styles.statusBadge, badgeStyle]}>
              <View style={[styles.statusBadgeDot, dotStyle]} />
              <Text style={[styles.statusBadgeText, textStyle]}>
                {statusLabel(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Token</Text>
              <View style={styles.tokenRow}>
                <Text
                  style={[styles.metaValue, styles.metaValueMono]}
                  numberOfLines={1}
                >
                  {maskToken(item.token)}
                </Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => onCopyToken(item.token)}
                  activeOpacity={0.75}
                  hitSlop={responsiveHitSlop(1.4)}
                >
                  <Icon name="copy" size={14} color="#60A5FA" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.metaColumn, {alignItems: 'flex-end'}]}>
              <Text style={styles.metaLabel}>Created</Text>
              <Text
                style={[styles.metaValue, styles.metaValueMono]}
                numberOfLines={1}
              >
                {formatCreatedDate(item.createdAt)}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Description</Text>
              <Text style={styles.metaValue} numberOfLines={2}>
                {item.description?.trim() ? item.description : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.cardActionRegenerate]}
              onPress={() => onRegenerate(item)}
              activeOpacity={0.75}
            >
              <Icon name="refresh-cw" size={13} color="#D97706" />
              <Text
                style={[
                  styles.cardActionText,
                  styles.cardActionTextRegenerate,
                ]}
              >
                Regenerate
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.cardActionEdit]}
              onPress={() => onEdit(item)}
              activeOpacity={0.75}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <>
                  <Icon name="edit-2" size={13} color="#059669" />
                  <Text
                    style={[styles.cardActionText, styles.cardActionTextEdit]}
                  >
                    Edit
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.cardActionDelete]}
              onPress={() => onDelete(item)}
              activeOpacity={0.75}
            >
              <Icon name="trash-2" size={13} color="#EF4444" />
              <Text
                style={[styles.cardActionText, styles.cardActionTextDelete]}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const SendersScreen = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<MainTabParamList, 'Senders'>>();
  const isFocused = useIsFocused();
  const openNotifications = useOpenNotifications();
  const {token, isAuthenticated} = useAuth();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const premium = useMemo(() => createPremium(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [senders, setSenders] = useState<SenderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All Status');
  const [visibleCount, setVisibleCount] = useState(SENDERS_PAGE_SIZE);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSender, setEditingSender] = useState<SenderRecord | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);

  const listBottomInset = insets.bottom + TAB_BAR_HEIGHT + hp(2);
  const listRef = useRef<FlatList<SenderRecord>>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const itemAnimsRef = useRef<Record<string, Animated.Value>>({});
  const animatedIdsRef = useRef<Set<string>>(new Set());
  const hasPlayedHeaderEntranceRef = useRef(false);
  const hasFocusedOnceRef = useRef(false);

  const stats = useMemo(
    () => ({
      total: senders.length,
      active: senders.filter(s => s.status === 'active').length,
      inactive: senders.filter(s => s.status === 'inactive').length,
    }),
    [senders],
  );

  const filteredSenders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const status = filterToStatus(statusFilter);

    return senders.filter(sender => {
      const matchesSearch =
        !query ||
        sender.name.toLowerCase().includes(query) ||
        sender.description?.toLowerCase().includes(query);
      const matchesStatus = !status || sender.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [senders, searchQuery, statusFilter]);

  const visibleSenders = useMemo(
    () => filteredSenders.slice(0, visibleCount),
    [filteredSenders, visibleCount],
  );

  const hasMore = visibleCount < filteredSenders.length;

  useEffect(() => {
    setVisibleCount(SENDERS_PAGE_SIZE);
  }, [searchQuery, statusFilter]);

  const getItemAnim = (id: string) => {
    if (!itemAnimsRef.current[id]) {
      itemAnimsRef.current[id] = new Animated.Value(0);
    }
    return itemAnimsRef.current[id];
  };

  const animateNewSenderItems = useCallback((items: SenderRecord[]) => {
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
          tension: 65,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, []);

  useEffect(() => {
    if (hasPlayedHeaderEntranceRef.current) {
      headerAnim.setValue(1);
      searchAnim.setValue(1);
      return;
    }

    hasPlayedHeaderEntranceRef.current = true;

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
    ]).start();
  }, [headerAnim, searchAnim]);

  useEffect(() => {
    animateNewSenderItems(visibleSenders);
  }, [animateNewSenderItems, visibleSenders]);

  const loadSenders = useCallback(
    async ({silent = false}: {silent?: boolean} = {}) => {
      if (!isAuthenticated) {
        setLoading(false);
        setLoadError('Please sign in to view senders.');
        return;
      }

      if (!silent) {
        setLoading(true);
        animatedIdsRef.current.clear();
      }
      setLoadError(null);

      try {
        const status = filterToStatus(statusFilter);
        const params = {
          limit: 200,
          search: searchQuery.trim() || undefined,
          status: status ?? undefined,
        };

        let results = await listSenders(token, params);
        if (results.length === 0) {
          results = await searchSenders(token, params);
        }
        setSenders(results);
      } catch (error) {
        if (!silent) {
          setLoadError(
            error instanceof ApiError ? error.message : 'Unable to load senders.',
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [isAuthenticated, searchQuery, statusFilter, token],
  );

  useEffect(() => {
    void loadSenders();
  }, [loadSenders]);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return;
      }

      void loadSenders({silent: true});
    }, [loadSenders]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (!isFocused) {
        return;
      }
      listRef.current?.scrollToOffset({offset: 0, animated: true});
      void loadSenders({silent: true});
    });

    return unsubscribe;
  }, [isFocused, loadSenders, navigation]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore) {
      return;
    }
    setVisibleCount(prev =>
      Math.min(prev + SENDERS_PAGE_SIZE, filteredSenders.length),
    );
  }, [filteredSenders.length, hasMore]);

  const handleEdit = async (sender: SenderRecord) => {
    if (!isAuthenticated) {
      return;
    }
    setEditLoadingId(sender.id);
    try {
      const fresh = await getSenderById(token, sender.id);
      setEditingSender(fresh);
      setEditModalVisible(true);
    } catch (error) {
      Alert.alert(
        'Unable to load sender',
        error instanceof ApiError
          ? error.message
          : 'Could not fetch sender details.',
      );
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleDelete = (sender: SenderRecord) => {
    Alert.alert('Delete Sender', `Remove "${sender.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!isAuthenticated) {
            return;
          }
          try {
            await deleteSender(token, sender.id);
            setSenders(prev => prev.filter(s => s.id !== sender.id));
          } catch (error) {
            Alert.alert(
              'Delete failed',
              error instanceof ApiError
                ? error.message
                : 'Unable to delete sender.',
            );
          }
        },
      },
    ]);
  };

  const handleRegenerate = (sender: SenderRecord) => {
    Alert.alert(
      'Regenerate Token',
      `Generate a new token for "${sender.name}"? The old token will stop working.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Regenerate',
          onPress: async () => {
            if (!isAuthenticated) {
              return;
            }
            try {
              await regenerateSenderToken(token, sender.id);
              await loadSenders({silent: true});
            } catch (error) {
              Alert.alert(
                'Regenerate failed',
                error instanceof ApiError
                  ? error.message
                  : 'Unable to regenerate token.',
              );
            }
          },
        },
      ],
    );
  };

  const handleCopyToken = (token: string) => {
    Alert.alert('Token', token, [{text: 'OK'}]);
  };

  const handleClearFilters = () => {
    animatedIdsRef.current.clear();
    setSearchQuery('');
    setStatusFilter('All Status');
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingSender(null);
  };

  const handleCreateSender = async (sender: SenderRecord) => {
    if (!isAuthenticated) {
      return;
    }
    try {
      await createSender(token, sender);
      setAddModalVisible(false);
      await loadSenders({silent: true});
      listRef.current?.scrollToOffset({offset: 0, animated: true});
    } catch (error) {
      Alert.alert(
        'Create failed',
        error instanceof ApiError ? error.message : 'Unable to create sender.',
      );
    }
  };

  const handleUpdateSender = async (sender: SenderRecord) => {
    if (!isAuthenticated) {
      return;
    }
    try {
      await updateSender(token, sender);
      closeEditModal();
      await loadSenders({silent: true});
    } catch (error) {
      Alert.alert(
        'Update failed',
        error instanceof ApiError ? error.message : 'Unable to update sender.',
      );
    }
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

  const renderSenderCard = ({item}: {item: SenderRecord}) => (
    <SenderListItem
      item={item}
      entranceAnim={getItemAnim(item.id)}
      editLoading={editLoadingId === item.id}
      onRegenerate={handleRegenerate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCopyToken={handleCopyToken}
    />
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <Animated.View style={[styles.screenHeader, headerStyle]}>
        <View style={styles.screenHeaderLeft}>
          <View style={styles.headerIconWrap}>
            <Icon name="send" size={20} color={colors.primary} />
          </View>
          <View style={styles.screenHeaderText}>
            <Text style={styles.screenTitle} numberOfLines={2}>
              Senders Management
            </Text>
            <Text style={styles.screenSubtitle}>
              Configure and manage audio upload senders.
            </Text>
          </View>
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

      <Animated.View style={headerStyle}>
        <TouchableOpacity
          style={styles.addSenderButton}
          activeOpacity={0.85}
          onPress={() => setAddModalVisible(true)}
        >
          <Icon name="plus" size={16} color={colors.textOnPrimary} />
          <Text style={styles.addSenderButtonText}>Add Sender</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsScrollContent}
      >
        <StatCard
          label="Total Senders"
          value={stats.total}
          subLabel="All senders"
          icon="mail"
          iconStyle="blue"
          iconColor="#3B82F6"
        />
        <StatCard
          label="Active"
          value={stats.active}
          subLabel="Active senders"
          icon="check-circle"
          iconStyle="green"
          iconColor="#22C55E"
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          subLabel="Inactive senders"
          icon="pause-circle"
          iconStyle="orange"
          iconColor="#F59E0B"
        />
      </ScrollView>

      <Animated.View style={[styles.filtersSection, searchBarStyle]}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={18}
            color={premium.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search senders by name or description..."
            placeholderTextColor={premium.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusChipsScroll}
            contentContainerStyle={styles.statusChipsContent}
          >
            {STATUS_FILTER_OPTIONS.map(option => {
              const isActive = option === statusFilter;
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.statusChip,
                    isActive && styles.statusChipActive,
                  ]}
                  onPress={() => setStatusFilter(option)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      isActive && styles.statusChipTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {(searchQuery.trim().length > 0 || statusFilter !== 'All Status') && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
            activeOpacity={0.8}
          >
            <Icon name="rotate-cw" size={14} color={colors.primary} />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );

  const listFooter = hasMore ? (
    <View style={styles.loadMoreFooter}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  ) : (
    <View style={styles.listFooter} />
  );

  return (
    <View style={styles.container}>
      {listHeader}

      <FlatList
        ref={listRef}
        style={styles.list}
        data={visibleSenders}
        keyExtractor={item => item.id}
        renderItem={renderSenderCard}
        ListFooterComponent={listFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: listBottomInset},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.emptyStateText}>
                {loadError ??
                  (senders.length === 0 &&
                  !searchQuery.trim() &&
                  statusFilter === 'All Status'
                    ? 'No senders yet. Tap Add Sender to create one.'
                    : 'No senders match your search.')}
              </Text>
            )}
          </View>
        }
      />

      <SenderFormModal
        visible={addModalVisible}
        mode="add"
        sender={null}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleCreateSender}
      />

      <SenderFormModal
        visible={editModalVisible}
        mode="edit"
        sender={editingSender}
        onClose={closeEditModal}
        onSubmit={handleUpdateSender}
      />
    </View>
  );
};

export default SendersScreen;
