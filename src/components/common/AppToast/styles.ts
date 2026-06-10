import {Platform, StyleSheet} from 'react-native';
import {fonts} from '../../../config/constants';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const createAppToastStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: wp(5),
      right: wp(5),
      alignItems: 'center',
      zIndex: 9999,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2.5),
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: wp(3),
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.4),
      maxWidth: '100%',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 6},
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        android: {elevation: 8},
      }),
    },
    text: {
      flex: 1,
      fontSize: responsiveSize(13),
      fontFamily: fonts.medium,
      color: colors.text,
    },
  });
