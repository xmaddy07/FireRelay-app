/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import {displayRemoteMessageNotification} from './src/services/notifications/firebaseMessaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FireRelay] [fcm:background]', remoteMessage?.messageId);
  await displayRemoteMessageNotification(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
