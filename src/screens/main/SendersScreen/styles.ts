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
  card: {
    backgroundColor: colors.surface,
    borderRadius: wp(5),
    padding: wp(5),
    marginBottom: hp(2),
  },
  cardTitle: {
    fontSize: responsiveSize(18),
    fontFamily: fonts.semibold,
    color: colors.text,
    marginBottom: hp(0.5),
  },
  cardText: {
    fontSize: responsiveSize(14),
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
});
