import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#07080e',
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#0f1324',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  email: {
    marginTop: 6,
    color: '#9ca3af',
  },
});
