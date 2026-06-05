import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useTheme, useThemedStyles} from '../../../config/theme';
import {createKeywordFilterSheetStyles} from './keywordFiltersBottomSheet.styles';
import {
  DEFAULT_KEYWORD_FILTERS,
  KEYWORD_STATUS_FILTER_OPTIONS,
  type KeywordFilters,
  type KeywordSeverityFilter,
  type KeywordStatusFilter,
} from './types';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: KeywordFilters) => void;
  appliedFilters?: KeywordFilters | null;
  severityOptions: KeywordSeverityFilter[];
};

const KeywordFiltersBottomSheet = ({
  visible,
  onClose,
  onApply,
  appliedFilters,
  severityOptions,
}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createKeywordFilterSheetStyles);
  const [filters, setFilters] = useState<KeywordFilters>(DEFAULT_KEYWORD_FILTERS);
  const appliedFiltersRef = useRef(appliedFilters);
  appliedFiltersRef.current = appliedFilters;

  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const applied = appliedFiltersRef.current;
      setFilters(applied ?? DEFAULT_KEYWORD_FILTERS);
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

  const handleReset = () => {
    setFilters(DEFAULT_KEYWORD_FILTERS);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const renderChip = <T extends string>(
    value: T,
    selected: T,
    onSelect: (next: T) => void,
  ) => {
    const isActive = value === selected;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.chip, isActive && styles.chipActive]}
        onPress={() => onSelect(value)}
        activeOpacity={0.7}
      >
        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[styles.bottomSheet, {transform: [{translateY: slideAnim}]}]}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetHeader}>
              <View style={styles.titleContainer}>
                <AntDesign name="filter" size={18} color={colors.primary} />
                <Text style={styles.sheetTitle}>Filters</Text>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
                  <Text style={styles.resetButton}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <AntDesign
                    name="close"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.chipRow}>
                {KEYWORD_STATUS_FILTER_OPTIONS.map(option =>
                  renderChip<KeywordStatusFilter>(
                    option,
                    filters.status,
                    status =>
                      setFilters(prev => ({
                        ...prev,
                        status,
                      })),
                  ),
                )}
              </View>

              <Text style={styles.sectionTitle}>Severity</Text>
              <View style={styles.severityRow}>
                {severityOptions.map(option =>
                  renderChip<KeywordSeverityFilter>(
                    option,
                    filters.severity,
                    severity =>
                      setFilters(prev => ({
                        ...prev,
                        severity,
                      })),
                  ),
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default KeywordFiltersBottomSheet;
