import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {Platform} from 'react-native';
import {requestNotificationPermission} from '../permissions/notificationPermission';
import {logger} from '../../utils/logger';

let foregroundUnsubscribe: (() => void) | null = null;
let notificationChannelPromise: Promise<string> | null = null;
const FIRE_RELAY_CHANNEL_ID = 'firerelay-alerts';

const logIncomingMessage = (
  source:
    | 'foreground'
    | 'opened_from_background'
    | 'opened_from_quit'
    | 'background',
  message: FirebaseMessagingTypes.RemoteMessage,
) => {
  logger.debug(`[fcm:${source}]`, {
    messageId: message.messageId,
    data: message.data,
    notification: message.notification,
  });
};

const getNotificationChannelId = () => {
  if (!notificationChannelPromise) {
    notificationChannelPromise = notifee.createChannel({
      id: FIRE_RELAY_CHANNEL_ID,
      name: 'FireRelay Alerts',
      importance: AndroidImportance.HIGH,
    });
  }

  return notificationChannelPromise;
};

const shouldDisplayWithNotifee = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  if (Platform.OS === 'android') {
    return true;
  }

  // iOS already renders notification-payload pushes natively (correct app icon).
  // Notifee re-creates them as local notifications, which can show the grid placeholder.
  return !remoteMessage.notification;
};

export const displayRemoteMessageNotification = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  if (!shouldDisplayWithNotifee(remoteMessage)) {
    return;
  }
  const dataTitle = remoteMessage.data?.title;
  const dataBody = remoteMessage.data?.body;
  const title =
    remoteMessage.notification?.title ??
    (typeof dataTitle === 'string' ? dataTitle : undefined);
  const body =
    remoteMessage.notification?.body ??
    (typeof dataBody === 'string' ? dataBody : undefined);

  if (!title && !body) {
    return;
  }

  const channelId = await getNotificationChannelId();

  await notifee.displayNotification({
    title: title ?? 'FireRelay',
    body,
    data: remoteMessage.data,
    ios: {
      foregroundPresentationOptions: {
        alert: true,
        badge: true,
        sound: true,
      },
    },
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
  });
};

export const initializeFirebaseMessaging = async (): Promise<void> => {
  if (foregroundUnsubscribe) {
    return;
  }

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    logger.debug('Push notification permission denied.');
    return;
  }

  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch (error) {
    logger.error('Failed to register device for remote messages', error);
    return;
  }

  try {
    const fcmToken = await messaging().getToken();
    logger.debug('FCM token acquired', fcmToken);
  } catch (error) {
    logger.error('Failed to get FCM token', error);
  }

  foregroundUnsubscribe = messaging().onMessage(async remoteMessage => {
    logIncomingMessage('foreground', remoteMessage);
    // iOS foreground pushes with a notification payload are shown natively via firebase.json.
    await displayRemoteMessageNotification(remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    logIncomingMessage('opened_from_background', remoteMessage);
  });

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    logIncomingMessage('opened_from_quit', initialNotification);
  }
};
