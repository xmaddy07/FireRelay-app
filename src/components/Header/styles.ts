import {StyleSheet} from 'react-native';
import { fonts } from '../../constants';

export const styles = StyleSheet.create({
  container: {
    backgroundColor:'#05070A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  menuButton: {
    position: 'absolute',
    left:10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.semibold,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: '#cbd5e1',
    marginTop: 4,
  },
});
