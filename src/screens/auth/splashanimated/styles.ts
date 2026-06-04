import {StyleSheet} from 'react-native';
import {hp, wp} from '../../../utils/responsive';
import type {AppColors} from '../../../config/theme/types';

export const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    animation: {
      width: wp(88),
      height: hp(42),
    },
  });
