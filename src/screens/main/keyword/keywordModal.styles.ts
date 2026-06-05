import {StyleSheet, Platform} from 'react-native';
import {fonts} from '../../../config/constants';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp, responsiveSize} from '../../../utils/responsive';
import {createPremium} from './styles';

export const createKeywordModalStyles = (colors: AppColors) => {
  const premium = createPremium(colors);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(3),
    },
    card: {
      backgroundColor: premium.surface,
      borderRadius: wp(4),
      borderWidth: 1,
      borderColor: premium.borderStrong,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 12},
          shadowOpacity: 0.15,
          shadowRadius: 28,
        },
        android: {elevation: 14},
      }),
    },
    header: {
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(1.4),
    },
    headerTitle: {
      fontSize: responsiveSize(20),
      fontFamily: fonts.semibold,
      color: colors.text,
    },
    body: {
      paddingHorizontal: wp(5),
      paddingBottom: hp(1),
      gap: hp(0.4),
    },
    fieldLabel: {
      fontSize: responsiveSize(13),
      color: premium.textMuted,
      marginBottom: hp(0.8),
      fontFamily: fonts.medium,
    },
    required: {
      color: colors.primary,
    },
    textInput: {
      borderWidth: 1,
      borderColor: premium.borderStrong,
      borderRadius: wp(2.5),
      paddingHorizontal: wp(3.5),
      paddingVertical: Platform.OS === 'ios' ? hp(1.3) : hp(1),
      fontSize: responsiveSize(14),
      fontFamily: fonts.regular,
      color: colors.text,
      marginBottom: hp(1.6),
      backgroundColor: premium.searchBg,
    },
    textArea: {
      minHeight: hp(14),
      textAlignVertical: 'top',
      paddingTop: Platform.OS === 'ios' ? hp(1.3) : hp(1),
    },
    activeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2.5),
      marginBottom: hp(1.6),
    },
    checkbox: {
      width: wp(5.2),
      height: wp(5.2),
      borderRadius: wp(1.2),
      borderWidth: 1.5,
      borderColor: premium.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    activeLabel: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.medium,
      color: colors.text,
    },
    severityRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2),
      marginBottom: hp(1.6),
    },
    severityChip: {
      paddingVertical: hp(0.7),
      paddingHorizontal: wp(3),
      borderRadius: wp(5),
      borderWidth: 1.5,
      borderColor: premium.borderStrong,
      backgroundColor: premium.searchBg,
    },
    severityChipActive: {
      borderWidth: 2,
    },
    severityChipLow: {
      borderColor: 'rgba(34, 197, 94, 0.45)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    severityChipLowActive: {
      borderColor: '#16A34A',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
    },
    severityChipMedium: {
      borderColor: 'rgba(245, 158, 11, 0.45)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    severityChipMediumActive: {
      borderColor: '#D97706',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
    },
    severityChipCritical: {
      borderColor: 'rgba(185, 28, 28, 0.5)',
      backgroundColor: 'rgba(185, 28, 28, 0.12)',
    },
    severityChipCriticalActive: {
      borderColor: '#B91C1C',
      backgroundColor: 'rgba(185, 28, 28, 0.22)',
    },
    severityChipHigh: {
      borderColor: 'rgba(239, 68, 68, 0.45)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    severityChipHighActive: {
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    severityChipText: {
      fontSize: responsiveSize(12),
      fontFamily: fonts.bold,
      letterSpacing: responsiveSize(0.5),
      color: premium.textMuted,
    },
    severityChipTextLow: {
      color: '#16A34A',
    },
    severityChipTextMedium: {
      color: '#D97706',
    },
    severityChipTextCritical: {
      color: '#B91C1C',
    },
    severityChipTextHigh: {
      color: '#EF4444',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: wp(2.5),
      paddingHorizontal: wp(5),
      paddingVertical: hp(2),
      borderTopWidth: 1,
      borderTopColor: premium.border,
      backgroundColor: premium.surfaceRaised,
    },
    cancelButton: {
      borderWidth: 1,
      borderColor: premium.borderStrong,
      borderRadius: wp(2.5),
      paddingHorizontal: wp(4.5),
      paddingVertical: hp(1.2),
      backgroundColor: colors.menuItemBorder,
    },
    cancelButtonText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.semibold,
      color: premium.textMuted,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: wp(2.5),
      paddingHorizontal: wp(4.5),
      paddingVertical: hp(1.2),
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.35,
          shadowRadius: 8,
        },
        android: {elevation: 4},
      }),
    },
    submitButtonDisabled: {
      opacity: 0.45,
    },
    submitButtonText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.semibold,
      color: colors.textOnPrimary,
    },
  });
};
