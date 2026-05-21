export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Notifications: undefined;
};

export type SettingsStackParamList = {
  Menu: undefined;
  Profile: undefined;
  Password: undefined;
  Subscription: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
