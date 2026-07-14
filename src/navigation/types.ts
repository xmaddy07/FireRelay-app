import type {NavigatorScreenParams} from '@react-navigation/native';
import type {CountyListItem} from '../api/types/county';

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Notifications: undefined;
};

export type FeedStackParamList = {
  FeedList: {audioId?: string} | undefined;
  CountyDetail: {
    countyId: string;
    countyName?: string;
    /** Snapshot from the counties strip so detail can paint before network. */
    countySeed?: CountyListItem;
  };
};

export type MainTabParamList = {
  Feed: NavigatorScreenParams<FeedStackParamList> | undefined;
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
