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
import { useTheme, useThemedStyles } from '../../theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type FilterState = {
  counties: string[];
  keywordPriority: string;
  fromDate: string;
  toDate: string;
  keywords: string;
  talkgroup: string;
  alertStatus: string;
  recordsMatched: number;
};

const DEFAULT_FILTER_STATE: FilterState = {
  counties: [],
  keywordPriority: 'All',
  fromDate: '',
  toDate: '',
  keywords: '',
  talkgroup: '',
  alertStatus: 'Flagged',
  recordsMatched: 1088,
};

type AppliedFilters = Omit<FilterState, 'alertStatus' | 'recordsMatched'>;

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
  appliedFilters?: AppliedFilters | null;
};

const AdvancedFiltersBottomSheet = ({
  visible,
  onClose,
  onApply,
  appliedFilters,
}: Props) => {
  const {colors, glass, isDark} = useTheme();
  const styles = useThemedStyles(createStyles);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const appliedFiltersRef = useRef(appliedFilters);
  appliedFiltersRef.current = appliedFilters;

  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'fromDate' | 'toDate'>('fromDate');

  useEffect(() => {
    if (visible) {
      const applied = appliedFiltersRef.current;
      setFilters({
        ...DEFAULT_FILTER_STATE,
        ...(applied ?? {}),
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

  const formatDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    const hr = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${hr}:${min}`;
  };

  const openDatePicker = (field: 'fromDate' | 'toDate') => {
    setActiveDateField(field);
    setDatePickerOpen(true);
  };

  const handleDateConfirm = (date: Date) => {
    setDatePickerOpen(false);
    setFilters({
      ...filters,
      [activeDateField]: formatDate(date),
    });
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
                <Text style={styles.recordsMatchedText}>
                  {filters.recordsMatched.toLocaleString()} RECORDS MATCHED
                </Text>
              </View>

              <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
              >
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
                    {['Travis', 'Wilco', 'McLennan'].map(countyName => {
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

                  <Text style={styles.sectionTitle}>Keyword Priority</Text>
                  <View style={styles.priorityContainer}>
                    {['All', 'High', 'Medium', 'Low', 'Nada'].map(priority => {
                      const isActive = filters.keywordPriority === priority;
                      return (
                        <TouchableOpacity
                          key={priority}
                          style={[
                            styles.priorityOption,
                            isActive && styles.priorityOptionActive,
                          ]}
                          onPress={() =>
                            setFilters(prev => ({ ...prev, keywordPriority: priority }))
                          }
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.priorityOptionText,
                              isActive && styles.priorityOptionTextActive,
                            ]}
                          >
                            {priority}
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
                          placeholder="Day & Time"
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
                          placeholder="Day & Time"
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
        date={
          filters[activeDateField]
            ? (() => {
              const parts = filters[activeDateField].split(' ');
              const datePart = parts[0];
              const timePart = parts[1] || '00:00';
              const [d, m, y] = datePart.split('/').map(Number);
              const [hr, min] = timePart.split(':').map(Number);
              const date = new Date(y, m - 1, d, hr, min);
              return isNaN(date.getTime()) ? new Date() : date;
            })()
            : new Date()
        }
        mode="datetime"
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
