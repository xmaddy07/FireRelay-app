import {Platform, StyleSheet} from 'react-native';
import {fonts} from '../../../config/constants';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const createAppDialogStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      paddingHorizontal: wp(5),
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: wp(4),
      borderWidth: 1,
      borderColor: colors.borderMuted,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 12},
          shadowOpacity: 0.18,
          shadowRadius: 28,
        },
        android: {elevation: 14},
      }),
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingTop: hp(2.4),
      paddingBottom: hp(1),
      gap: hp(1.2),
    },
    iconWrap: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(6),
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapDefault: {
      backgroundColor: colors.primaryTint,
    },
    iconWrapDestructive: {
      backgroundColor: 'rgba(239, 68, 68, 0.14)',
    },
    iconWrapInfo: {
      backgroundColor: 'rgba(96, 165, 250, 0.14)',
    },
    iconWrapSuccess: {
      backgroundColor: 'rgba(76, 175, 80, 0.14)',
    },
    title: {
      fontSize: responsiveSize(18),
      fontFamily: fonts.semibold,
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.regular,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: responsiveSize(20),
      paddingHorizontal: wp(5),
      paddingBottom: hp(2.2),
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: wp(2.5),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.8),
      borderTopWidth: 1,
      borderTopColor: colors.menuItemBorder,
      backgroundColor: colors.surfaceElevated,
    },
    footerSingle: {
      justifyContent: 'center',
    },
    cancelButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: wp(2.5),
      paddingVertical: hp(1.2),
      alignItems: 'center',
      backgroundColor: colors.menuItemBorder,
    },
    cancelButtonText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.semibold,
      color: colors.textMuted,
    },
    confirmButton: {
      flex: 1,
      borderRadius: wp(2.5),
      paddingVertical: hp(1.2),
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    confirmButtonDestructive: {
      backgroundColor: '#EF4444',
    },
    confirmButtonDisabled: {
      opacity: 0.5,
    },
    confirmButtonText: {
      fontSize: responsiveSize(14),
      fontFamily: fonts.semibold,
      color: colors.textOnPrimary,
    },
    confirmButtonTextDestructive: {
      color: colors.white,
    },
  });
