import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {hp, wp, responsiveSize} from '../../../utils/responsive';
import {fonts} from '../../../config/constants';

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
}: Props) => (
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
        color="#4B5563"
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
              style={[styles.option, isLast && styles.optionLast, isActive && styles.optionActive]}
              onPress={() => onSelect(speed)}
              activeOpacity={0.75}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {formatSpeedLabel(speed)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    zIndex: 30,
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
    backgroundColor: '#FFFFFF',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  triggerOpen: {
    backgroundColor: '#FAFAFA',
  },
  triggerText: {
    fontSize: responsiveSize(10),
    fontFamily: fonts.bold,
    color: '#1F2937',
    includeFontPadding: false,
  },
  menu: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: hp(0.4),
    minWidth: wp(14),
    maxWidth: wp(22),
    borderRadius: wp(2),
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
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
    paddingHorizontal: wp(3),
    paddingVertical: wp(2.2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionActive: {
    backgroundColor: '#FFF5F5',
  },
  optionText: {
    fontSize: responsiveSize(10.5),
    fontFamily: fonts.medium,
    color: '#6B7280',
    textAlign: 'center',
  },
  optionTextActive: {
    color: '#FF5451',
    fontFamily: fonts.bold,
  },
});

export default PlaybackSpeedControl;
