import React, {useState, useRef, useEffect} from 'react';
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
import {styles} from './styles';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type FilterState = {
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

const AdvancedFiltersBottomSheet = ({visible, onClose, onApply}: Props) => {
  const [filters, setFilters] = useState<FilterState>({
    fromDate: '',
    toDate: '',
    keywords: '',
    talkgroup: '',
    talkgroupId: '',
    alertStatus: 'Flagged / Priority',
    recordsMatched: 1088,
  });

  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handlePreset = (days: number | null) => {
    const today = new Date();
    let fromDate = new Date();

    if (days === null) {
      fromDate = today;
    } else {
      fromDate.setDate(today.getDate() - days);
    }

    const formatDate = (date: Date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    };

    setFilters({
      ...filters,
      fromDate: formatDate(fromDate),
      toDate: formatDate(today),
    });
  };

  const handleReset = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      keywords: '',
      talkgroup: '',
      talkgroupId: '',
      alertStatus: 'Flagged / Priority',
      recordsMatched: 0,
    });
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose();
  };

  return (
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
                <Text style={styles.filterIcon}>☰</Text>
                <Text style={styles.sheetTitle}>Advanced Filters</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                  <Text style={styles.resetButton}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
                  <Text style={styles.closeIcon}>✕</Text>
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
              {/* DATE & TIME SECTION */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>DATE & TIME</Text>

                <View style={styles.presetsContainer}>
                  {[
                    {label: 'Today', value: null},
                    {label: 'Yesterday', value: 1},
                    {label: 'Last 7 days', value: 7},
                    {label: 'Last 30 days', value: 30},
                  ].map(preset => (
                    <TouchableOpacity
                      key={preset.label}
                      style={styles.presetButton}
                      onPress={() => handlePreset(preset.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.presetButtonText}>{preset.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.dateRow}>
                  <View style={styles.dateColumn}>
                    <Text style={styles.label}>From</Text>
                    <View style={styles.dateInputContainer}>
                      <TextInput
                        style={styles.dateInput}
                        placeholder="dd/mm/yyyy"
                        placeholderTextColor="#64748b"
                        value={filters.fromDate}
                        onChangeText={value =>
                          setFilters({...filters, fromDate: value})
                        }
                      />
                      <Text style={styles.calendarIcon}>📅</Text>
                    </View>
                  </View>
                  <View style={styles.dateColumn}>
                    <Text style={styles.label}>To</Text>
                    <View style={styles.dateInputContainer}>
                      <TextInput
                        style={styles.dateInput}
                        placeholder="dd/mm/yyyy"
                        placeholderTextColor="#64748b"
                        value={filters.toDate}
                        onChangeText={value =>
                          setFilters({...filters, toDate: value})
                        }
                      />
                      <Text style={styles.calendarIcon}>📅</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* SEARCH CONFIGURATION SECTION */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SEARCH CONFIGURATION</Text>

                <View style={styles.searchGroup}>
                  <Text style={styles.label}>Keywords</Text>
                  <View style={styles.searchInputContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search in transcriptions..."
                      placeholderTextColor="#64748b"
                      value={filters.keywords}
                      onChangeText={value =>
                        setFilters({...filters, keywords: value})
                      }
                    />
                    <Text style={styles.searchIcon}>🔍</Text>
                  </View>
                </View>

                <View style={styles.talkgroupRow}>
                  <View style={styles.talkgroupColumn}>
                    <Text style={styles.label}>Talkgroup</Text>
                    <TextInput
                      style={styles.talkgroupInput}
                      placeholder="Filter by group..."
                      placeholderTextColor="#64748b"
                      value={filters.talkgroup}
                      onChangeText={value =>
                        setFilters({...filters, talkgroup: value})
                      }
                    />
                  </View>
                  <View style={styles.talkgroupColumn}>
                    <Text style={styles.label}>Talkgroup ID</Text>
                    <TextInput
                      style={styles.talkgroupInput}
                      placeholder="ID..."
                      placeholderTextColor="#64748b"
                      value={filters.talkgroupId}
                      onChangeText={value =>
                        setFilters({...filters, talkgroupId: value})
                      }
                    />
                  </View>
                </View>
              </View>

              {/* SYSTEM STATUS SECTION */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>

                <View style={styles.statusGroup}>
                  <Text style={styles.label}>Alert Status</Text>
                  <TouchableOpacity style={styles.statusDropdown} activeOpacity={0.7}>
                    <Text style={styles.statusDropdownText}>
                      {filters.alertStatus}
                    </Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Info message */}
                <View style={styles.infoBox}>
                  <View style={styles.infoDot} />
                  <Text style={styles.infoText}>
                    Live monitoring filters active for real-time feed
                  </Text>
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
  );
};

export default AdvancedFiltersBottomSheet;
