import {Platform} from 'react-native';
import {endpoints} from '../endpoints';
import {authorizedRequest} from '../utils';

export type RegisterDevicePayload = {
  token: string;
  platform: 'ios' | 'android';
};

const getPlatform = (): RegisterDevicePayload['platform'] =>
  Platform.OS === 'ios' ? 'ios' : 'android';

export async function registerDevice(
  authToken: string,
  fcmToken: string,
): Promise<void> {
  const payload: RegisterDevicePayload = {
    token: fcmToken,
    platform: getPlatform(),
  };

  await authorizedRequest(authToken, endpoints.devices.root, {
    method: 'POST',
    body: payload,
  });
}
