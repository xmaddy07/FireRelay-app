import {useEffect} from 'react';
import {forceLogoutDueToSessionRevocation} from '../services/auth/forceLogout';
import {
  isSessionRevokedSocketError,
  shouldLogoutOnSessionRevocation,
} from '../services/auth/sessionRevocation';
import {socketEvents} from '../services/socket/socketEvents';
import {socketService} from '../services/socket/socketService';
import {useAppSelector} from '../redux/hooks';

export const useSessionRevocation = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const token = useAppSelector(state => state.auth.token);
  const sessionId = useAppSelector(state => state.auth.sessionId);
  const userId = useAppSelector(state => state.user.id);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    socketService.connect(token);

    const handleSessionRevoked = (payload: unknown) => {
      if (
        shouldLogoutOnSessionRevocation(payload, sessionId, userId)
      ) {
        forceLogoutDueToSessionRevocation();
      }
    };

    const handleSocketError = (payload: unknown) => {
      if (isSessionRevokedSocketError(payload)) {
        forceLogoutDueToSessionRevocation();
      }
    };

    const unsubscribers = [
      socketService.on(socketEvents.sessionRevoked, handleSessionRevoked),
      socketService.on(socketEvents.sessionsRevoked, handleSessionRevoked),
      socketService.on(socketEvents.error, handleSocketError),
    ];

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      socketService.disconnect();
    };
  }, [isAuthenticated, token, sessionId, userId]);
};
