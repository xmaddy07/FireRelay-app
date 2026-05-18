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
import { styles } from './styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type FilterState = {
  county: string;
  keywordPriority: string;
  fromDate: string;
  toDate: string;
  keywords: string;
  talkgroup: string;
  talkgroupId: string;
  alertStatus: string;
  recordsMatched: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
};

const AdvancedFiltersBottomSheet = ({ visible, onClose, onApply }: Props) => {
  const [filters, setFilters] = useState<FilterState>({
    county: '',
    keywordPriority: 'All',
    fromDate: '',
    toDate: '',
    keywords: '',
    talkgroup: '',
    talkgroupId: '',
    alertStatus: 'Flagged',
    recordsMatched: 1088,
  });

  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'fromDate' | 'toDate'>('fromDate');

  useEffect(() => {
    if (visible) {
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
    setFilters(prev => ({
      ...prev,
      county: prev.county === countyName ? '' : countyName,
    }));
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
      county: '',
      keywordPriority: 'All',
      fromDate: '',
      toDate: '',
      keywords: '',
      talkgroup: '',
      talkgroupId: '',
      alertStatus: 'Flagged',
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
                  <AntDesign name="filter" size={18} color="#3b82f6" />
                  <Text style={styles.sheetTitle}>Filters</Text>
                </View>
                <View style={styles.headerRight}>
                  <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                    <Text style={styles.resetButton}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                    <AntDesign name="close" size={18} color="#3b82f6" />
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
                {/* SEARCH BAR (KEYWORDS) */}
                <View style={styles.section}>
                  <View style={styles.searchGroup}>
                    <Text style={styles.label}>Keywords</Text>
                    <View style={styles.searchInputContainer}>
                      <Octicons name="search" size={20} color="#3b82f6" style={styles.searchIconLeft} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search in transcriptions..."
                        placeholderTextColor="#64748b"
                        value={filters.keywords}
                        onChangeText={value =>
                          setFilters({ ...filters, keywords: value })
                        }
                      />
                    </View>
                  </View>
                </View>

                {/* COUNTY & KEYWORD PRIORITY & TIME SECTION */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>County</Text>

                  <View style={styles.presetsContainer}>
                    {['Travis', 'Wilco', 'McLennan'].map(countyName => {
                      const isActive = filters.county === countyName;
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
                          <Text style={[
                            styles.presetButtonText,
                            isActive && styles.presetButtonTextActive,
                          ]}>
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
                          onPress={() => setFilters(prev => ({ ...prev, keywordPriority: priority }))}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.priorityOptionText,
                            isActive && styles.priorityOptionTextActive,
                          ]}>
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
                          placeholderTextColor="#64748b"
                          value={filters.fromDate}
                          editable={false}
                          pointerEvents="none"
                        />
                        <AntDesign name="calendar" size={20} color="#3b82f6" />
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
                          placeholderTextColor="#64748b"
                          value={filters.toDate}
                          editable={false}
                          pointerEvents="none"
                        />
                        <AntDesign name="calendar" size={20} color="#3b82f6" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* TALKGROUP SECTION */}
                <View style={styles.section}>
                  <View style={styles.searchGroup}>
                    <Text style={styles.label}>Talkgroup</Text>
                    <TextInput
                      style={styles.talkgroupInput}
                      placeholder="Filter by group..."
                      placeholderTextColor="#64748b"
                      value={filters.talkgroup}
                      onChangeText={value =>
                        setFilters({ ...filters, talkgroup: value })
                      }
                    />
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
        theme="dark"
        confirmText="Select"
        cancelText="Cancel"
      />
    </>
  );
};

export default AdvancedFiltersBottomSheet;
