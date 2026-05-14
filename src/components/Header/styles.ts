import {StyleSheet} from 'react-native';
import {fonts} from '../../constants';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#05070A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  menuButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  rightButtonsContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
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
