import {StyleSheet} from 'react-native';
import {fonts} from '../../../config/constants';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const createKeywordFilterSheetStyles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
    },
    bottomSheet: {
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: wp(6),
      borderTopRightRadius: wp(6),
      paddingTop: hp(2),
      maxHeight: '85%',
      paddingBottom: hp(3),
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingBottom: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: colors.menuItemBorder,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },
    sheetTitle: {
      fontSize: responsiveSize(22),
      fontFamily: fonts.semibold,
      color: colors.text,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(3),
    },
    resetButton: {
      fontSize: responsiveSize(14),
      color: colors.textMuted,
      fontFamily: fonts.semibold,
    },
    closeButton: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      backgroundColor: colors.menuItemBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContainer: {
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
    },
    sectionTitle: {
      fontSize: responsiveSize(11),
      fontFamily: fonts.semibold,
      color: colors.textSecondary,
      letterSpacing: responsiveSize(1.2),
      marginBottom: hp(1.5),
      textTransform: 'uppercase',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2),
      marginBottom: hp(2.5),
    },
    chip: {
      paddingVertical: hp(0.9),
      paddingHorizontal: wp(3.5),
      borderRadius: wp(5),
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
      backgroundColor: colors.inputBackground,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryTint,
    },
    chipText: {
      fontSize: responsiveSize(13),
      color: colors.text,
      fontFamily: fonts.medium,
    },
    chipTextActive: {
      color: colors.primary,
      fontFamily: fonts.semibold,
    },
    severityRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: wp(2),
      marginBottom: hp(1),
    },
    applyButton: {
      marginHorizontal: wp(4),
      marginTop: hp(2),
      paddingVertical: hp(1.5),
      backgroundColor: colors.primary,
      borderRadius: wp(3),
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: responsiveSize(16),
      color: colors.textOnPrimary,
      fontFamily: fonts.semibold,
    },
  });
