import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

const requestIosNotificationPermission = async (): Promise<boolean> => {
  const authorizationStatus = await messaging().requestPermission();
  return (
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return requestIosNotificationPermission();
  }

  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};
