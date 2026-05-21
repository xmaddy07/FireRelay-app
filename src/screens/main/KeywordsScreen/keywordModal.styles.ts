import {StyleSheet, Platform} from 'react-native';
import {fonts} from '../../../constants';
import type {AppColors} from '../../../theme/types';
import {hp, wp, responsiveSize} from '../../../utils/responsive';
import {createPremium} from './styles';

export const createKeywordModalStyles = (colors: AppColors) => {
  const premium = createPremium(colors);

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
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
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 12},
          shadowOpacity: 0.45,
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
