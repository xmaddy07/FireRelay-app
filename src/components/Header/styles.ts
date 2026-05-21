import { StyleSheet } from 'react-native';
import {fonts} from '../../constants';
import type { AppColors } from "../../theme/types";
import { hp, wp, responsiveSize } from '../../utils/responsive';

export const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(2),
  },
  menuButton: {
    position: 'absolute',
    left: wp(2.5),
    top: hp(1.2),
    width: wp(11),
    height: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  menuIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: colors.iconTint,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(13),
  },
  rightButtonsContainer: {
    position: 'absolute',
    right: wp(2.5),
    top: hp(1.2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    zIndex: 10,
  },
  filterButton: {
    width: wp(9.5),
    height: wp(9.5),
    borderRadius: wp(2.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 84, 81, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 84, 81, 0.4)',
  },
  filterIcon: {
    width: wp(5.3),
    height: wp(5.3),
    tintColor: colors.textSecondary,
  },
  filterIconActive: {
    tintColor: colors.primary,
  },
  notificationButton: {
    width: wp(10.5),
    height: wp(10.5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: wp(4.5),
    height: wp(4.5),
    tintColor: colors.iconTint,
  },
  notificationButtonBordered: {
    borderWidth: 1,
    borderColor: 'rgba(255, 84, 81, 0.4)',
    borderRadius: wp(5.5),
    backgroundColor: 'rgba(255, 84, 81, 0.12)',
  },
  notificationIconAccent: {
    tintColor: colors.primary,
  },
  stackedContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
  },
  stackedBackButton: {
    marginBottom: hp(1),
    alignSelf: 'flex-start',
    width: wp(11),
    height: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stackedTitleBlock: {
    flex: 1,
    paddingRight: wp(3),
  },
  stackedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  stackedTitle: {
    fontSize: responsiveSize(28),
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  stackedSubtitle: {
    fontSize: responsiveSize(14),
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: hp(0.6),
    lineHeight: responsiveSize(20),
    maxWidth: wp(68),
  },
  title: {
    fontSize: responsiveSize(18),
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: responsiveSize(15),
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginTop: hp(0.5),
  },
});
