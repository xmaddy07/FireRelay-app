import {useEffect} from 'react';
import {useAuth} from './useAuth';
import {requestNotificationPermission} from '../services/permissions/notificationPermission';
import {
  resetFcmTokenSyncState,
  subscribeFcmTokenRefresh,
  syncFcmToken,
} from '../services/notifications/fcmTokenSync';

export const useFcmTokenSync = () => {
  const {isAuthenticated, token} = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      resetFcmTokenSyncState();
      return;
    }

    let unsubscribe = () => {};

    void (async () => {
      await requestNotificationPermission();
      await syncFcmToken(token);
      unsubscribe = subscribeFcmTokenRefresh(token);
    })();

    return () => {
      unsubscribe();
      resetFcmTokenSyncState();
    };
  }, [isAuthenticated, token]);
};
