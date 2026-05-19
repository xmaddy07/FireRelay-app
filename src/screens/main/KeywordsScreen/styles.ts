import {StyleSheet} from 'react-native';
import {colors} from '../../../constants';
import {hp, wp, responsiveSize} from '../../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
  },
  title: {
    fontSize: responsiveSize(34),
    fontWeight: '800',
    color: colors.text,
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: responsiveSize(15),
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
    borderRadius: wp(4),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    marginRight: wp(3),
    marginBottom: hp(1.2),
  },
  chipText: {
    color: '#e2e8f0',
    fontSize: responsiveSize(14),
  },
});
