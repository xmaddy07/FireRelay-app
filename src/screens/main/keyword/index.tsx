import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Pressable,
  Animated,
  Easing,
  Image,
  ActivityIndicator,
  StyleSheet,
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
import {
  ApiError,
  createKeyword,
  deleteKeyword,
  listKeywords,
  searchKeywords,
  updateKeyword,
} from '../../../api';
import {useAuth} from '../../../hooks/useAuth';
import {useAppDialog} from '../../../context';
import KeywordFiltersBottomSheet from './KeywordFiltersBottomSheet';
import KeywordFormModal from './KeywordFormModal';
import KeywordListSkeleton from './KeywordListSkeleton';
import {
  getKeywordSeverityFilterOptions,
  isDefaultKeywordFilters,
  keywordFiltersToSearchParams,
} from './keywordFilters';
import {
  DEFAULT_KEYWORD_FILTERS,
  KEYWORDS_PAGE_SIZE,
  type KeywordFilters,
  type KeywordRecord,
} from './types';
import {getListSeverityStyles} from './severityStyles';

type KeywordStatCardProps = {
  label: string;
  value: number | string;
  variant: 'total' | 'active' | 'inactive';
};

const KeywordStatCard = ({label, value, variant}: KeywordStatCardProps) => {
  const styles = useThemedStyles(createStyles);

  const indicator =
    variant === 'total' ? (
      <View style={[styles.statIconWrap, styles.statIconGreen]}>
        <Icon name="activity" size={14} color="#16A34A" />
      </View>
    ) : (
      <View
        style={[
          styles.statDot,
          variant === 'active' ? styles.statDotActive : styles.statDotInactive,
        ]}
      />
    );

  return (
    <View style={styles.statCard}>
      <View style={styles.statCardTop}>
        {indicator}
        <View style={styles.statCardContent}>
          <Text style={styles.statLabel} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
      </View>
    </View>
  );
};

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
  const severityStyles = getListSeverityStyles(item.severity, styles);

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
        style={styles.keywordCard}
      >
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
            {item.severity ? (
              <>
                <View style={styles.statusDivider} />
                <View style={severityStyles.badge}>
                  <Text style={severityStyles.text}>{item.severity}</Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Description</Text>
              <Text style={styles.metaValue} numberOfLines={2}>
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
  const {token} = useAuth();
  const {confirm, showError} = useAppDialog();
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);
  const premium = useMemo(() => createPremium(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [keywords, setKeywords] = useState<KeywordRecord[]>([]);
  const [allKeywords, setAllKeywords] = useState<KeywordRecord[]>([]);
  const [searchResults, setSearchResults] = useState<KeywordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<KeywordFilters>(DEFAULT_KEYWORD_FILTERS);
  const [editingKeyword, setEditingKeyword] = useState<KeywordRecord | null>(
    null,
  );

  const listBottomInset = insets.bottom + TAB_BAR_HEIGHT + hp(2);
  const searchAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const addButtonAnim = useRef(new Animated.Value(1)).current;
  const addButtonPulse = useRef(new Animated.Value(0)).current;
  const addButtonPress = useRef(new Animated.Value(1)).current;
  const filterToClearAnim = useRef(new Animated.Value(0)).current;
  const itemAnimsRef = useRef<Record<string, Animated.Value>>({});
  const animatedIdsRef = useRef<Set<string>>(new Set());

  const getItemAnim = (id: string) => {
    if (!itemAnimsRef.current[id]) {
      itemAnimsRef.current[id] = new Animated.Value(1);
    }
    return itemAnimsRef.current[id];
  };

  const animateNewKeywordItems = (items: KeywordRecord[]) => {
    const newItems = items.filter(item => !animatedIdsRef.current.has(item.id));
    if (newItems.length === 0) {
      return;
    }

    newItems.forEach(item => {
      animatedIdsRef.current.add(item.id);
      getItemAnim(item.id).setValue(1);
    });
  };

  useEffect(() => {
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
  }, [addButtonPulse]);

  const hasSearchText = searchQuery.length > 0;
  useEffect(() => {
    Animated.timing(filterToClearAnim, {
      toValue: hasSearchText ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [hasSearchText, filterToClearAnim]);

  const filterOpacity = filterToClearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const filterScale = filterToClearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.3],
  });
  const filterRotate = filterToClearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-90deg'],
  });

  const clearOpacity = filterToClearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const clearScale = filterToClearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const clearRotate = filterToClearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg'],
  });

  const isSearching = debouncedSearch.length > 0;
  const hasActiveFilters = !isDefaultKeywordFilters(appliedFilters);

  const filterOptionSource = useMemo(() => {
    if (allKeywords.length > 0) {
      return allKeywords;
    }
    return isSearching ? searchResults : keywords;
  }, [allKeywords, isSearching, keywords, searchResults]);

  const severityFilterOptions = useMemo(
    () => getKeywordSeverityFilterOptions(filterOptionSource),
    [filterOptionSource],
  );

  const displayKeywords = isSearching ? searchResults : keywords;
  const displayHasMore = isSearching ? searchHasMore : hasMore;
  const isListLoading = isSearching ? searchLoading : loading;

  const stats = useMemo(() => {
    const source = allKeywords.length > 0 ? allKeywords : keywords;
    const total = totalCount > 0 ? totalCount : source.length;
    return {
      total,
      active: source.filter(item => item.active).length,
      inactive: source.filter(item => !item.active).length,
    };
  }, [allKeywords, keywords, totalCount]);

  const formatStatValue = (count: number) =>
    loading && allKeywords.length === 0 && totalCount === 0
      ? '—'
      : count.toLocaleString();

  useEffect(() => {
    animateNewKeywordItems(displayKeywords);
  }, [displayKeywords]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedSearch(prev => {
        if (trimmed !== prev) {
          if (trimmed.length > 0) {
            setSearchLoading(true);
            setSearchResults([]);
          } else {
            setLoading(true);
            setKeywords([]);
          }
        }
        return trimmed;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const mergeKeywords = useCallback(
    (existing: KeywordRecord[], incoming: KeywordRecord[]) => {
      const map = new Map(existing.map(item => [item.id, item]));
      incoming.forEach(item => map.set(item.id, item));
      return Array.from(map.values());
    },
    [],
  );

  const loadAllKeywords = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const merged = await listKeywords(token);
      setAllKeywords(merged);
    } catch {
      // Keep the last known cache when prefetch is unavailable.
    }
  }, [token]);

  const loadKeywords = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setLoadError(null);

      try {
        const result = await searchKeywords(token, {
          page: pageToLoad,
          limit: KEYWORDS_PAGE_SIZE,
          ...keywordFiltersToSearchParams(appliedFilters),
        });

        if (!append) {
          animatedIdsRef.current.clear();
        }

        setKeywords(prev => {
          if (!append) {
            return result.items;
          }
          const existingIds = new Set(prev.map(item => item.id));
          const nextItems = result.items.filter(
            item => !existingIds.has(item.id),
          );
          return [...prev, ...nextItems];
        });
        setAllKeywords(current => mergeKeywords(current, result.items));
        setPage(pageToLoad);
        setHasMore(result.hasMore);
        if (result.totalFromApi) {
          setTotalCount(result.total);
        }
      } catch (error) {
        if (!append) {
          setKeywords([]);
        }
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to load keywords.',
        );
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [appliedFilters, mergeKeywords, token],
  );

  const loadSearchResults = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (!token || !debouncedSearch) {
        return;
      }

      if (append) {
        setLoadingMore(true);
      } else {
        setSearchLoading(true);
      }
      setLoadError(null);

      try {
        const result = await searchKeywords(token, {
          page: pageToLoad,
          limit: KEYWORDS_PAGE_SIZE,
          search: debouncedSearch,
          keyword: debouncedSearch,
          ...keywordFiltersToSearchParams(appliedFilters),
        });

        if (!append) {
          animatedIdsRef.current.clear();
        }

        setSearchResults(prev => {
          if (!append) {
            return result.items;
          }
          const existingIds = new Set(prev.map(item => item.id));
          const nextItems = result.items.filter(
            item => !existingIds.has(item.id),
          );
          return [...prev, ...nextItems];
        });
        setAllKeywords(current => mergeKeywords(current, result.items));
        setSearchPage(pageToLoad);
        setSearchHasMore(result.hasMore);
        setSearchTotalCount(
          result.totalFromApi ? result.total : result.items.length,
        );
      } catch (error) {
        if (!append) {
          setSearchResults([]);
        }
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'Unable to search keywords.',
        );
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setSearchLoading(false);
        }
      }
    },
    [appliedFilters, debouncedSearch, mergeKeywords, token],
  );

  useEffect(() => {
    if (isSearching) {
      return;
    }
    animatedIdsRef.current.clear();
    setPage(1);
    setHasMore(true);
    setSearchResults([]);
    setSearchTotalCount(0);
    loadKeywords(1, false);
  }, [appliedFilters, isSearching, loadKeywords]);

  useEffect(() => {
    if (!isSearching) {
      return;
    }
    animatedIdsRef.current.clear();
    setSearchPage(1);
    setSearchHasMore(true);
    setSearchResults([]);
    void loadSearchResults(1, false);
  }, [appliedFilters, debouncedSearch, isSearching, loadSearchResults]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void loadAllKeywords();
  }, [loadAllKeywords, token]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleLoadMore = useCallback(() => {
    if (isListLoading || loadingMore || !displayHasMore) {
      return;
    }
    if (isSearching) {
      void loadSearchResults(searchPage + 1, true);
      return;
    }
    void loadKeywords(page + 1, true);
  }, [
    displayHasMore,
    isListLoading,
    isSearching,
    loadKeywords,
    loadSearchResults,
    loadingMore,
    page,
    searchPage,
  ]);

  const handleEdit = (keyword: KeywordRecord) => {
    setEditingKeyword(keyword);
    setEditModalVisible(true);
  };

  const handleDelete = (keyword: KeywordRecord) => {
    confirm('Delete Keyword', `Remove "${keyword.name}"?`, {
      variant: 'destructive',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        if (!token) {
          return;
        }
        await deleteKeyword(token, keyword.id);
        setKeywords(prev => prev.filter(k => k.id !== keyword.id));
        setAllKeywords(prev => prev.filter(k => k.id !== keyword.id));
        setSearchResults(prev => prev.filter(k => k.id !== keyword.id));
        if (isSearching) {
          setSearchTotalCount(prev => Math.max(0, prev - 1));
        } else {
          setTotalCount(prev => Math.max(0, prev - 1));
        }
      },
    });
  };

  const handleAddKeyword = () => {
    setAddModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingKeyword(null);
  };

  const handleCreateKeyword = async (keyword: KeywordRecord) => {
    if (!token) {
      return;
    }
    try {
      await createKeyword(token, keyword);
      setAddModalVisible(false);
      if (isSearching) {
        setSearchPage(1);
        setSearchHasMore(true);
        await loadSearchResults(1, false);
      } else {
        setPage(1);
        setHasMore(true);
        await loadKeywords(1, false);
      }
      await loadAllKeywords();
    } catch (error) {
      showError('Create failed', error);
    }
  };

  const handleUpdateKeyword = async (keyword: KeywordRecord) => {
    if (!token) {
      return;
    }
    try {
      const updated = await updateKeyword(token, keyword);
      setKeywords(prev =>
        prev.map(item => (item.id === keyword.id ? updated : item)),
      );
      setAllKeywords(prev =>
        prev.map(item => (item.id === keyword.id ? updated : item)),
      );
      setSearchResults(prev =>
        prev.map(item => (item.id === keyword.id ? updated : item)),
      );
      closeEditModal();
    } catch (error) {
      showError('Update failed', error);
    }
  };

  const handleFilterPress = () => {
    setFilterSheetVisible(true);
  };

  const handleApplyFilters = (filters: KeywordFilters) => {
    const options = getKeywordSeverityFilterOptions(filterOptionSource);
    const nextFilters: KeywordFilters =
      filters.severity !== 'All' && !options.includes(filters.severity)
        ? {...filters, severity: 'All'}
        : filters;

    if (isSearching) {
      setSearchLoading(true);
      setSearchResults([]);
    } else {
      setLoading(true);
      setKeywords([]);
    }
    setAppliedFilters(nextFilters);
    setLoadError(null);
    animatedIdsRef.current.clear();
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
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View
            style={[
              styles.filterButton,
              hasActiveFilters && !hasSearchText && styles.filterButtonActive,
              { overflow: 'hidden' }
            ]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: filterOpacity,
                  transform: [{ scale: filterScale }, { rotate: filterRotate }],
                },
              ]}
              pointerEvents={hasSearchText ? 'none' : 'auto'}
            >
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                onPress={handleFilterPress}
                activeOpacity={0.8}
                hitSlop={responsiveHitSlop(1.4)}
              >
                <Image
                  source={images.filter}
                  style={[
                    styles.filterIcon,
                    hasActiveFilters && styles.filterIconActive,
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: clearOpacity,
                  transform: [{ scale: clearScale }, { rotate: clearRotate }],
                },
              ]}
              pointerEvents={hasSearchText ? 'auto' : 'none'}
            >
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => handleSearchChange('')}
                activeOpacity={0.8}
                hitSlop={responsiveHitSlop(1.4)}
              >
                <Icon name="x" size={18} color={premium.textMuted} />
              </TouchableOpacity>
            </Animated.View>
          </View>
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

      <View style={styles.statsRow}>
        <KeywordStatCard
          label="Total Keywords"
          value={formatStatValue(stats.total)}
          variant="total"
        />
        <KeywordStatCard
          label="Active"
          value={formatStatValue(stats.active)}
          variant="active"
        />
        <KeywordStatCard
          label="Inactive"
          value={formatStatValue(stats.inactive)}
          variant="inactive"
        />
      </View>
    </View>
  );

  const listFooter =
    loadingMore && displayHasMore ? (
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
        style={styles.list}
        data={isListLoading ? [] : displayKeywords}
        keyExtractor={item => item.id}
        renderItem={renderKeywordCard}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: listBottomInset},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={listFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        ListEmptyComponent={
          isListLoading ? (
            <KeywordListSkeleton />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {loadError ??
                  (hasActiveFilters
                    ? 'No keywords match your filters.'
                    : isSearching
                      ? 'No keywords match your search.'
                      : 'No keywords found.')}
              </Text>
            </View>
          )
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

      <KeywordFiltersBottomSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        onApply={handleApplyFilters}
        appliedFilters={appliedFilters}
        severityOptions={severityFilterOptions}
      />
    </View>
  );
};

export default KeywordsScreen;
