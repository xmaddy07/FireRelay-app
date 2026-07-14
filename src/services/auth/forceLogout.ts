import {authActions} from '../../redux/slices/authSlice';
import {userActions} from '../../redux/slices/userSlice';
import {store} from '../../redux/store';
import {releaseFeedAudioCache} from '../../screens/main/feeds/feedAudioPreload';
import {dialogService} from '../dialogs/dialogService';
import {socketService} from '../socket/socketService';

let revocationAlertVisible = false;
let roleChangeAlertVisible = false;

let forceLogoutInFlight = false;

export const forceLogout = () => {
  if (forceLogoutInFlight) {
    return;
  }
  forceLogoutInFlight = true;
  try {
    socketService.disconnect();
    releaseFeedAudioCache();
    store.dispatch(authActions.logout());
    store.dispatch(userActions.clearUser());
  } finally {
    forceLogoutInFlight = false;
  }
};

export const forceLogoutDueToSessionRevocation = () => {
  const {isAuthenticated} = store.getState().auth;
  if (!isAuthenticated) {
    return;
  }

  forceLogout();

  if (revocationAlertVisible) {
    return;
  }

  revocationAlertVisible = true;
  dialogService.alert('Signed out', 'Your session was revoked. Please sign in again.', {
    onDismiss: () => {
      revocationAlertVisible = false;
    },
  });
};

export const forceLogoutDueToRoleChange = () => {
  const {isAuthenticated} = store.getState().auth;
  if (!isAuthenticated) {
    return;
  }

  forceLogout();

  if (roleChangeAlertVisible) {
    return;
  }

  roleChangeAlertVisible = true;
  dialogService.alert(
    'Role updated',
    'Your role has been updated. Please sign in again.',
    {
      onDismiss: () => {
        roleChangeAlertVisible = false;
      },
    },
  );
};
