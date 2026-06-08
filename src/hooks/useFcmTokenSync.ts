import {useEffect} from 'react';
import {useAuth} from './useAuth';
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

    void syncFcmToken(token);
    const unsubscribe = subscribeFcmTokenRefresh(token);

    return () => {
      unsubscribe();
      resetFcmTokenSyncState();
    };
  }, [isAuthenticated, token]);
};
