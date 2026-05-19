import {StyleSheet} from 'react-native';
import {colors} from '../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  statusCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  statusText: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  controls: {
    marginTop: 12,
  },
});
