import {StyleSheet} from 'react-native';
import {hp, wp, responsiveSize} from '../../../utils/responsive';
import { fonts } from '../../../constants';

export const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    padding: wp(6),
  },
  brand: {
    marginBottom: hp(4),
  },
  brandIcon: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(3),
    backgroundColor: '#ff6f00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(1),
  },
  brandIconImage: {
    width: wp(10),
    height: wp(10),
  },
  brandTitle: {
    color: '#fff',
    fontSize: responsiveSize(38),
    fontWeight: '800',
    marginBottom: hp(1.5),
  },
  brandTitleImage: {
    width: wp(35),
    height: wp(35),
    marginBottom: hp(2),
    alignSelf:'center'
  },
  brandSubtitle: {
    color: '#ffffff',
    fontSize: responsiveSize(24),
    fontFamily:fonts.semibold,
    maxWidth: '92%',
    marginTop: hp(3),
  },
  form: {
    width: '100%',
  },
  primaryButton: {
    marginTop: hp(4),
    borderRadius: wp(4),
    paddingVertical: hp(2.2),
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: responsiveSize(18),
    fontWeight: '700',
  },
});
