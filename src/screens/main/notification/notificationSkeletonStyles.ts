import {Platform, StyleSheet} from 'react-native';
import type {AppColors} from '../../../config/theme/types';
import {hp, wp} from '../../../utils/responsive';

export const createNotificationSkeletonStyles = (colors: AppColors) =>
  StyleSheet.create({
    notificationSkeletonList: {
      gap: hp(1.4),
      paddingTop: hp(0.2),
    },
    notificationSkeletonCard: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: wp(4),
      borderWidth: 1,
      borderColor: colors.menuItemBorder,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {elevation: 3},
      }),
    },
    notificationSkeletonRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: hp(1.6),
      paddingHorizontal: wp(3.5),
      gap: wp(3),
    },
    notificationSkeletonContent: {
      flex: 1,
      minWidth: 0,
      gap: hp(0.6),
    },
    notificationSkeletonTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: wp(2),
    },
    notificationSkeletonLines: {
      gap: hp(0.45),
    },
    notificationSkeletonBlock: {
      borderRadius: wp(5),
      backgroundColor: colors.surfaceInset,
    },
    notificationSkeletonIcon: {
      borderRadius: wp(3),
      flexShrink: 0,
    },
  });
