import {StyleSheet} from 'react-native';
import {fonts} from '../../../constants';
import type { AppColors } from "../../../theme/types";
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
  },
  title: {
    fontSize: responsiveSize(34),
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: responsiveSize(15),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: hp(3),
    lineHeight: responsiveSize(22),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp(2),
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: wp(4),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    marginRight: wp(3),
    marginBottom: hp(1.2),
  },
  chipText: {
    color: colors.text,
    fontSize: responsiveSize(14),
    fontFamily: fonts.regular,
  },
});
