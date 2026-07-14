import {useEffect, useRef} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {getProfile} from '../api';
import {useAppSelector} from '../redux/hooks';
import {
  handleRoleChangeSocketPayload,
  isRoleEventForOtherUser,
  syncProfileOrLogoutOnRoleChange,
} from '../services/auth/roleChange';
import {socketEvents} from '../services/socket/socketEvents';
import {socketService} from '../services/socket/socketService';

/** Poll every few seconds so role changes are caught quickly without a socket event. */
const ROLE_CHECK_INTERVAL_MS = 3_000;

export const useRoleChangeWatch = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const token = useAppSelector(state => state.auth.token);
  const userId = useAppSelector(state => state.user.id);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    let cancelled = false;

    const checkRole = async () => {
      if (cancelled || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      try {
        const profile = await getProfile(token);
        if (!cancelled) {
          syncProfileOrLogoutOnRoleChange(profile);
        }
      } catch {
        // Network errors are ignored; 401 already triggers forceLogout via the API client.
      } finally {
        inFlightRef.current = false;
      }
    };

    void checkRole();

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void checkRole();
      }
    };

    const onSocketRoleEvent = (payload: unknown) => {
      if (isRoleEventForOtherUser(payload, userId)) {
        return;
      }
      if (handleRoleChangeSocketPayload(payload)) {
        return;
      }
      void checkRole();
    };

    const appSub = AppState.addEventListener('change', onAppStateChange);
    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        void checkRole();
      }
    }, ROLE_CHECK_INTERVAL_MS);

    const unsubscribers = [
      socketService.on(socketEvents.userUpdated, onSocketRoleEvent),
      socketService.on(socketEvents.roleChanged, onSocketRoleEvent),
      socketService.on(socketEvents.userRoleChanged, onSocketRoleEvent),
    ];

    return () => {
      cancelled = true;
      appSub.remove();
      clearInterval(intervalId);
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [isAuthenticated, token, userId]);
};
