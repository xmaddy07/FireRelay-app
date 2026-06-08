import type {NavigatorScreenParams} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Feed: {audioId?: string} | undefined;
  Keywords: undefined;
  LeadLog: undefined;
  Senders: undefined;
  Settings: undefined;
};

export type SettingsStackParamList = {
  Menu: undefined;
  Profile: undefined;
  ProfileEmailOtp: {
    currentEmail: string;
    newEmail: string;
  };
  Password: undefined;
  Subscription: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
