import {StyleSheet} from 'react-native';
import {colors} from '../../../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  sessionInfo: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginBottom: 24,
  },
  infoLabel: {
    color: colors.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
    color: colors.text,
  },
  footer: {
    marginTop: 16,
  },
});
