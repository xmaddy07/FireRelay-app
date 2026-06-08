import messaging from '@react-native-firebase/messaging';
import {registerDevice} from '../../api';
import {logger} from '../../utils/logger';
import {getFcmToken} from './firebaseMessaging';

let lastSyncedToken: string | null = null;
let lastAuthToken: string | null = null;

export const resetFcmTokenSyncState = () => {
  lastSyncedToken = null;
  lastAuthToken = null;
};

export const syncFcmToken = async (
  authToken: string,
  fcmToken?: string | null,
): Promise<void> => {
  const resolved = fcmToken ?? (await getFcmToken());
  if (!resolved) {
    return;
  }

  if (resolved === lastSyncedToken && authToken === lastAuthToken) {
    return;
  }

  try {
    await registerDevice(authToken, resolved);
    lastSyncedToken = resolved;
    lastAuthToken = authToken;
    logger.debug('FCM token synced to backend');
  } catch (error) {
    logger.error('Failed to sync FCM token', error);
  }
};

export const subscribeFcmTokenRefresh = (
  authToken: string,
): (() => void) => {
  return messaging().onTokenRefresh(newToken => {
    void syncFcmToken(authToken, newToken);
  });
};
