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
    padding: wp(6.4),
  },
  section: {
    marginBottom: hp(2.5),
    padding: wp(5.3),
    borderRadius: wp(5.9),
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontSize: responsiveSize(18),
    fontFamily: fonts.bold,
    marginBottom: hp(1),
    color: colors.text,
  },
  sectionText: {
    color: '#cbd5e1',
    fontSize: responsiveSize(15),
    fontFamily: fonts.regular,
  },
});
