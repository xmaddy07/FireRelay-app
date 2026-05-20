import {StyleSheet} from 'react-native';
import {fonts} from '../../constants';
import type { AppColors } from "../../theme/types";
import {hp, wp, responsiveSize} from '../../utils/responsive';

export const createStyles = (colors: AppColors) => StyleSheet.create({
  button: {
    paddingVertical: hp(1.7),
    paddingHorizontal: wp(5.3),
    borderRadius: wp(3.2),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp(1),
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  disabled: {
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
  },
  text: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: responsiveSize(16),
  },
});
