import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {Platform} from 'react-native';
import {openFeedAudioFromPush} from '../../navigation/navigationRef';
import {logger} from '../../utils/logger';

let foregroundUnsubscribe: (() => void) | null = null;
let notifeeForegroundUnsubscribe: (() => void) | null = null;
let notificationChannelPromise: Promise<string> | null = null;
const FIRE_RELAY_CHANNEL_ID = 'firerelay-alerts';

const AUDIO_ID_KEYS = [
  'audioId',
  'audio_id',
  'resourceId',
  'resource_id',
] as const;

const extractAudioIdFromPushData = (
  data?: FirebaseMessagingTypes.RemoteMessage['data'] | Record<string, unknown>,
): string | undefined => {
  if (!data) {
    return undefined;
  }

  for (const key of AUDIO_ID_KEYS) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  const metadata = data.metadata;
  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata) as Record<string, unknown>;
      for (const key of AUDIO_ID_KEYS) {
        const value = parsed[key];
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }
    } catch {
      // Ignore malformed metadata payloads.
    }
  } else if (metadata && typeof metadata === 'object') {
    const record = metadata as Record<string, unknown>;
    for (const key of AUDIO_ID_KEYS) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
  }

  return undefined;
};

const handlePushNotificationOpen = (
  data?: FirebaseMessagingTypes.RemoteMessage['data'] | Record<string, unknown>,
) => {
  const audioId = extractAudioIdFromPushData(data);
  if (!audioId) {
    return;
  }

  openFeedAudioFromPush(audioId);
};

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

export const getFcmToken = async (): Promise<string | null> => {
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    return token || null;
  } catch (error) {
    logger.debug('FCM token unavailable', error);
    return null;
  }
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

  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch (error) {
    logger.debug('Remote message registration deferred', error);
  }

  foregroundUnsubscribe = messaging().onMessage(async remoteMessage => {
    logIncomingMessage('foreground', remoteMessage);
    // iOS foreground pushes with a notification payload are shown natively via firebase.json.
    await displayRemoteMessageNotification(remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    logIncomingMessage('opened_from_background', remoteMessage);
    handlePushNotificationOpen(remoteMessage.data);
  });

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    logIncomingMessage('opened_from_quit', initialNotification);
    handlePushNotificationOpen(initialNotification.data);
  }

  const initialNotifeeNotification = await notifee.getInitialNotification();
  if (initialNotifeeNotification) {
    handlePushNotificationOpen(initialNotifeeNotification.notification?.data);
  }

  if (!notifeeForegroundUnsubscribe) {
    notifeeForegroundUnsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        handlePushNotificationOpen(detail.notification?.data);
      }
    });
  }
};
