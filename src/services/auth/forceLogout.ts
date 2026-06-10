import {authActions} from '../../redux/slices/authSlice';
import {userActions} from '../../redux/slices/userSlice';
import {store} from '../../redux/store';
import {dialogService} from '../dialogs/dialogService';
import {socketService} from '../socket/socketService';

let revocationAlertVisible = false;

export const forceLogout = () => {
  socketService.disconnect();
  store.dispatch(authActions.logout());
  store.dispatch(userActions.clearUser());
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
