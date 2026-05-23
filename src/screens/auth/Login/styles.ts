import {Platform, StyleSheet} from 'react-native';
import {hp, wp, responsiveSize} from '../../../utils/responsive';
import {fonts} from '../../../config/constants';
import type { AppColors } from "../../../config/theme/types";

const monoFont = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

export const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
    paddingBottom: hp(2),
  },
  header: {
    alignItems: 'center',
    marginBottom: hp(3.5),
  },
  logoBox: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(3),
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  logo: {
    width: wp(12),
    height: wp(12),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  brandFire: {
    color: colors.text,
    fontSize: responsiveSize(28),
    fontFamily: fonts.bold,
    letterSpacing: responsiveSize(1.5),
  },
  brandRelay: {
    color: colors.primary,
    fontSize: responsiveSize(28),
    fontFamily: fonts.bold,
    letterSpacing: responsiveSize(1.5),
  },
  brandTagline: {
    color: colors.textSecondary,
    fontSize: responsiveSize(10),
    fontFamily: monoFont,
    letterSpacing: responsiveSize(2),
    textTransform: 'uppercase',
  },
  loginCard: {
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
    paddingBottom: hp(2.5),
    overflow: 'hidden',
  },
  cardTitle: {
    color: colors.text,
    fontSize: responsiveSize(22),
    fontFamily: fonts.bold,
    marginBottom: hp(0.8),
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: responsiveSize(12),
    fontFamily: monoFont,
    marginBottom: hp(3),
    lineHeight: responsiveSize(18),
  },
  forgotCipher: {
    color: colors.textSecondary,
    fontSize: responsiveSize(11),
    fontFamily: monoFont,
    letterSpacing: responsiveSize(0.3),
  },
  primaryButton: {
    marginTop: hp(1),
    borderRadius: wp(1.5),
    paddingVertical: hp(2),
    marginVertical: 0,
  },
  errorText: {
    color: colors.primary,
    fontSize: responsiveSize(12),
    fontFamily: monoFont,
    marginBottom: hp(1.5),
    textAlign: 'center',
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: responsiveSize(14),
    fontFamily: fonts.bold,
    letterSpacing: responsiveSize(1.2),
  },
  cardDivider: {
    height: responsiveSize(1),
    backgroundColor: colors.border,
    marginTop: hp(2.5),
    marginBottom: hp(2),
  },
  registrationRow: {
    alignItems: 'center',
  },
  registrationText: {
    color: colors.textSecondary,
    fontSize: responsiveSize(12),
    fontFamily: monoFont,
    letterSpacing: responsiveSize(0.3),
  },
  registrationLink: {
    color: colors.text,
    fontFamily: fonts.semibold,
  },
  statusFooter: {
    alignItems: 'center',
    paddingBottom: hp(3),
    paddingTop: hp(2),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.6),
  },
  statusDot: {
    width: wp(1.6),
    height: wp(1.6),
    borderRadius: wp(0.8),
    backgroundColor: colors.success,
    marginRight: wp(2),
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: responsiveSize(10),
    fontFamily: monoFont,
    letterSpacing: responsiveSize(1),
  },
  securityText: {
    color: colors.textMuted,
    fontSize: responsiveSize(10),
    fontFamily: monoFont,
    letterSpacing: responsiveSize(1.2),
  },
  inputLabel: {
    fontFamily: monoFont,
    color: colors.textSecondary,
    fontSize: responsiveSize(11),
    letterSpacing: responsiveSize(0.3),
  },
  inputWrapper: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    borderRadius: wp(1.5),
    minHeight: hp(6),
  },
  inputField: {
    fontSize: responsiveSize(13),
    fontFamily: monoFont,
    color: colors.text,
  },
});
