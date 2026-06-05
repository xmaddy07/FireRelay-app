import {NativeModules, Platform} from 'react-native';

import appPackage from '../../package.json';
import type {LoginDeviceInfo} from '../api/types/auth';

type AndroidPlatformConstants = {
  Model?: string;
  Brand?: string;
  Release?: string;
};

type IOSPlatformConstants = {
  interfaceIdiom?: string;
  osVersion?: string;
  systemName?: string;
};

function isNativeDeviceInfoLinked(): boolean {
  return NativeModules.RNDeviceInfo != null;
}

function getPlatformDeviceInfo(): LoginDeviceInfo {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';

  if (platform === 'android') {
    const constants = Platform.constants as AndroidPlatformConstants;
    const model = constants.Model?.trim();
    const brand = constants.Brand?.trim();
    let deviceName = model || brand || 'Android Device';
    if (
      model &&
      brand &&
      !model.toLowerCase().startsWith(brand.toLowerCase())
    ) {
      deviceName = `${brand} ${model}`;
    }

    return {
      platform,
      deviceName,
      osVersion: constants.Release?.trim() || String(Platform.Version),
      appVersion: appPackage.version,
    };
  }

  const constants = Platform.constants as IOSPlatformConstants;
  const deviceName =
    constants.interfaceIdiom === 'pad'
      ? 'iPad'
      : constants.interfaceIdiom === 'phone'
        ? 'iPhone'
        : constants.systemName?.trim() || 'iOS Device';

  return {
    platform,
    deviceName,
    osVersion: constants.osVersion?.trim() || String(Platform.Version),
    appVersion: appPackage.version,
  };
}

export function getLoginDeviceInfo(): LoginDeviceInfo {
  if (!isNativeDeviceInfoLinked()) {
    return getPlatformDeviceInfo();
  }

  try {
    // Lazy require so we never touch DeviceInfo when the native module is missing.
    const DeviceInfo = require('react-native-device-info').default as {
      getModel: () => string;
      getSystemVersion: () => string;
      getVersion: () => string;
    };

    return {
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      deviceName: DeviceInfo.getModel().trim() || getPlatformDeviceInfo().deviceName,
      osVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
    };
  } catch {
    return getPlatformDeviceInfo();
  }
}
