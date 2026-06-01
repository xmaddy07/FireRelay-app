import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {hp, wp, responsiveSize} from '../../../utils/responsive';
import {fonts} from '../../../config/constants';
import {useTheme, useThemedStyles} from '../../../config/theme';
import type {AppColors} from '../../../config/theme/types';

export const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

export const formatSpeedLabel = (speed: PlaybackSpeed) =>
  speed === 1 ? '1x' : `${speed}x`;

type Props = {
  value: PlaybackSpeed;
  open: boolean;
  onToggle: () => void;
  onSelect: (speed: PlaybackSpeed) => void;
  menuAlign?: 'left' | 'right';
};

const PlaybackSpeedControl = ({
  value,
  open,
  onToggle,
  onSelect,
  menuAlign = 'right',
}: Props) => {
  const {colors} = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.trigger, open && styles.triggerOpen]}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        <Text style={styles.triggerText}>{formatSpeedLabel(value)}</Text>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={10}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {open ? (
        <View
          style={[
            styles.menu,
            menuAlign === 'left' ? styles.menuLeft : styles.menuRight,
          ]}
        >
          {PLAYBACK_SPEEDS.map((speed, index) => {
            const isActive = value === speed;
            const isLast = index === PLAYBACK_SPEEDS.length - 1;
            return (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.option,
                  isLast && styles.optionLast,
                  isActive && styles.optionActive,
                ]}
                onPress={() => onSelect(speed)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.optionTextActive,
                  ]}
                >
                  {formatSpeedLabel(speed)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrap: {
      position: 'relative',
      zIndex: 40,
      flexShrink: 0,
      maxWidth: 56,
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 6,
      backgroundColor: colors.surfaceElevated,
      gap: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    triggerOpen: {
      backgroundColor: colors.surface,
    },
    triggerText: {
      fontSize: responsiveSize(10),
      fontFamily: fonts.bold,
      color: colors.text,
      includeFontPadding: false,
    },
    menu: {
      position: 'absolute',
      top: '100%',
      marginTop: 4,
      width: 60,
      borderRadius: 8,
      backgroundColor: colors.surfaceElevated,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 10,
    },
    menuRight: {
      right: 0,
    },
    menuLeft: {
      left: 0,
    },
    option: {
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionActive: {
      backgroundColor: colors.primaryTint,
    },
    optionText: {
      fontSize: responsiveSize(10.5),
      fontFamily: fonts.medium,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    optionTextActive: {
      color: colors.primary,
      fontFamily: fonts.bold,
    },
  });

export default PlaybackSpeedControl;
