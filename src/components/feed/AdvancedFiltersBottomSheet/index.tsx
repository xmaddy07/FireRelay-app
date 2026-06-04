import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { createStyles } from './styles';
import { useTheme, useThemedStyles } from '../../../config/theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import { useAuth } from '../../../hooks/useAuth';
import { searchAudioWithPagination } from '../../../api';
import {
  filterDisplayDateToApi,
  formatFilterDisplayDate,
  parseFilterDisplayDate,
} from '../../../utils/filterDate';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type FeedAlertStatus = 'All' | 'Flagged';

export type FilterState = {
  counties: string[];
  fromDate: string;
  toDate: string;
  keywords: string;
  talkgroup: string;
  alertStatus: FeedAlertStatus;
  recordsMatched: number;
};

const ALERT_STATUS_TABS: FeedAlertStatus[] = ['All', 'Flagged'];

const DEFAULT_FILTER_STATE: FilterState = {
  counties: [],
  fromDate: '',
  toDate: '',
  keywords: '',
  talkgroup: '',
  alertStatus: 'All',
  recordsMatched: 0,
};

type AppliedFilters = Omit<FilterState, 'recordsMatched'>;

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
  appliedFilters?: AppliedFilters | null;
  availableCounties?: string[];
};

const AdvancedFiltersBottomSheet = ({
  visible,
  onClose,
  onApply,
  appliedFilters,
  availableCounties = [],
}: Props) => {
  const {colors, isDark} = useTheme();
  const styles = useThemedStyles(createStyles);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const appliedFiltersRef = useRef(appliedFilters);
  appliedFiltersRef.current = appliedFilters;

  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [activeDateField, setActiveDateField] = useState<'fromDate' | 'toDate'>('fromDate');

  const { token } = useAuth();
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    if (!visible || !token) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingCount(true);
      try {
        const result = await searchAudioWithPagination(token, {
          limit: 1, // Only need the total count
          counties: filters.counties.length ? filters.counties.join(',') : undefined,
          keywords: filters.keywords || undefined,
          talkgroup: filters.talkgroup || undefined,
          fromDate: filterDisplayDateToApi(filters.fromDate) || undefined,
          toDate: filterDisplayDateToApi(filters.toDate) || undefined,
          flagged: filters.alertStatus === 'Flagged' ? true : undefined,
        });
        setFilters(prev => ({
          ...prev,
          recordsMatched: result.total,
        }));
      } catch (error) {
        console.warn('Failed to update records matched count:', error);
      } finally {
        setLoadingCount(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    visible,
    token,
    filters.counties,
    filters.keywords,
    filters.talkgroup,
    filters.fromDate,
    filters.toDate,
    filters.alertStatus,
  ]);

  useEffect(() => {
    if (visible) {
      const applied = appliedFiltersRef.current;
      setFilters({
        ...DEFAULT_FILTER_STATE,
        ...(applied ?? {}),
        alertStatus: applied?.alertStatus ?? DEFAULT_FILTER_STATE.alertStatus,
        counties: applied?.counties ? [...applied.counties] : [],
      });
      setShowModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleCountySelect = (countyName: string) => {
    setFilters(prev => {
      const isSelected = prev.counties.includes(countyName);
      return {
        ...prev,
        counties: isSelected
          ? prev.counties.filter(name => name !== countyName)
          : [...prev.counties, countyName],
      };
    });
  };

  const openDatePicker = (field: 'fromDate' | 'toDate') => {
    setActiveDateField(field);
    setPickerDate(parseFilterDisplayDate(filters[field]) ?? new Date());
    setDatePickerOpen(true);
  };

  const handleDateConfirm = (date: Date) => {
    setDatePickerOpen(false);
    setFilters(prev => ({
      ...prev,
      [activeDateField]: formatFilterDisplayDate(date),
    }));
  };

  const handleReset = () => {
    setFilters({
      ...DEFAULT_FILTER_STATE,
      recordsMatched: 0,
    });
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose();
  };

  return (
    <>
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[styles.overlay, { opacity: fadeAnim }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={onClose}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              {/* Header with title and reset */}
              <View style={styles.sheetHeader}>
                <View style={styles.titleContainer}>
                  <AntDesign name="filter" size={18} color={colors.primary} />
                  <Text style={styles.sheetTitle}>Filters</Text>
                </View>
                <View style={styles.headerRight}>
                  <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                    <Text style={styles.resetButton}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                    <AntDesign name="close" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Records matched info */}
              <View style={styles.recordsInfoContainer}>
                {loadingCount ? (
                  <Text style={styles.recordsMatchedTextCalculating}>
                    CALCULATING...
                  </Text>
                ) : (
                  <Text style={styles.recordsMatchedText}>
                    {filters.recordsMatched.toLocaleString()} RECORDS MATCHED
                  </Text>
                )}
              </View>

              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Alerts</Text>
                  <View style={styles.priorityContainer}>
                    {ALERT_STATUS_TABS.map(status => {
                      const isActive = filters.alertStatus === status;
                      return (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.priorityOption,
                            isActive && styles.priorityOptionActive,
                          ]}
                          onPress={() =>
                            setFilters(prev => ({ ...prev, alertStatus: status }))
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.priorityOptionText,
                              isActive && styles.priorityOptionTextActive,
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.searchRowSection}>
                  <View style={styles.searchRowField}>
                    <Text style={styles.label}>Keywords</Text>
                    <View style={styles.searchInputContainer}>
                      <Octicons
                        name="search"
                        size={18}
                        color={colors.primary}
                        style={styles.searchIconLeft}
                      />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={colors.textMuted}
                        value={filters.keywords}
                        onChangeText={value =>
                          setFilters({ ...filters, keywords: value })
                        }
                      />
                    </View>
                  </View>
                  <View style={styles.searchRowField}>
                    <Text style={styles.label}>Talkgroup</Text>
                    <TextInput
                      style={styles.talkgroupInput}
                      placeholder="Filter by group..."
                      placeholderTextColor={colors.textMuted}
                      value={filters.talkgroup}
                      onChangeText={value =>
                        setFilters({ ...filters, talkgroup: value })
                      }
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>County</Text>
                  <View style={styles.presetsContainer}>
                    {availableCounties.map(countyName => {
                      const isActive = filters.counties.includes(countyName);
                      return (
                        <TouchableOpacity
                          key={countyName}
                          style={[
                            styles.presetButton,
                            isActive && styles.presetButtonActive,
                          ]}
                          onPress={() => handleCountySelect(countyName)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.presetButtonText,
                              isActive && styles.presetButtonTextActive,
                            ]}
                          >
                            {countyName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.dateRow}>
                    <View style={styles.dateColumn}>
                      <Text style={styles.label}>From</Text>
                      <TouchableOpacity
                        style={styles.dateInputContainer}
                        onPress={() => openDatePicker('fromDate')}
                        activeOpacity={0.7}
                      >
                        <TextInput
                          style={styles.dateInput}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor={colors.textMuted}
                          value={filters.fromDate}
                          editable={false}
                          pointerEvents="none"
                        />
                        <AntDesign name="calendar" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.dateColumn}>
                      <Text style={styles.label}>To</Text>
                      <TouchableOpacity
                        style={styles.dateInputContainer}
                        onPress={() => openDatePicker('toDate')}
                        activeOpacity={0.7}
                      >
                        <TextInput
                          style={styles.dateInput}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor={colors.textMuted}
                          value={filters.toDate}
                          editable={false}
                          pointerEvents="none"
                        />
                        <AntDesign name="calendar" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Apply button */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
                activeOpacity={0.8}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      <DatePicker
        modal
        open={datePickerOpen}
        date={pickerDate}
        mode="date"
        locale="en-GB"
        title="Select date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerOpen(false)}
        theme={isDark ? 'dark' : 'light'}
        confirmText="Select"
        cancelText="Cancel"
      />
    </>
  );
};

export default AdvancedFiltersBottomSheet;
