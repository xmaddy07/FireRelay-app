import {StyleSheet} from 'react-native';
import {hp, wp, responsiveSize} from '../../utils/responsive';

export const styles = StyleSheet.create({
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
    backgroundColor: '#0B1220',
    color: '#f5f7fb',
    fontSize: responsiveSize(14),
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    borderWidth: 0.9,
    borderColor: '#ff6f00',
    minHeight: hp(6.8),
  },
  iconContainer: {
    marginRight: wp(3),
  },
  input: {
    flex: 1,
    color: '#eef2ff',
    height: hp(5.8),
    fontSize: responsiveSize(16),
  },
  inputWithIcon: {
    paddingVertical: hp(1.6),
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: responsiveSize(12),
    marginTop: hp(0.5),
    marginLeft: wp(1),
  },
  inputError: {
    borderColor: '#ff4d4d',
  },
});
