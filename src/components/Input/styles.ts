import {StyleSheet} from 'react-native';
import {fonts} from '../../constants';
import type { AppColors } from "../../theme/types";
import {hp, wp, responsiveSize} from '../../utils/responsive';

export const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: hp(3),
    paddingTop: hp(1.2),
    position: 'relative',
  },
  label: {
    position: 'absolute',
    top: 0,
    left: wp(5.2),
    zIndex: 1,
    paddingHorizontal: wp(1.2),
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: responsiveSize(14),
    fontFamily: fonts.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    borderWidth: 0.9,
    borderColor: colors.primary,
    minHeight: hp(6.8),
  },
  iconContainer: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    color: colors.text,
    height: hp(5.8),
    fontSize: responsiveSize(16),
    fontFamily: fonts.regular,
  },
  inputWithIcon: {
    paddingVertical: hp(1.6),
  },
  errorText: {
    color: colors.primary,
    fontSize: responsiveSize(12),
    marginTop: hp(0.5),
    marginLeft: wp(1),
    fontFamily: fonts.regular,
  },
  inputError: {
    borderColor: colors.primary,
  },
  stackedContainer: {
    width: '100%',
    marginBottom: hp(2.4),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  stackedLabel: {
    color: colors.textSecondary,
    fontSize: responsiveSize(12),
    fontFamily: fonts.medium,
    letterSpacing: responsiveSize(0.4),
  },
  stackedInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: wp(2),
    paddingHorizontal: wp(3.5),
    borderWidth: 1,
    borderColor: colors.inputBorder,
    minHeight: hp(6.2),
  },
  stackedInput: {
    flex: 1,
    color: colors.text,
    height: hp(5.6),
    fontSize: responsiveSize(14),
    paddingVertical: hp(1.4),
    fontFamily: fonts.regular,
  },
});
