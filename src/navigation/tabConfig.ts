import type {ImageSourcePropType} from 'react-native';
import type {SFSymbol} from 'sf-symbols-typescript';
import {images} from '../constants';

export type TabBarConfig = {
  label: string;
  icon: ImageSourcePropType;
};

type IosTabSymbols = {
  inactive: SFSymbol;
  active: SFSymbol;
};

export const userTabLabels: Record<string, string> = {
  LiveFeed: 'Live Feed',
  LeadLog: 'Lead Log',
  KeywordRequest: 'Keyword',
  Settings: 'Settings',
};

export const adminTabLabels: Record<string, string> = {
  AdminConsole: 'Admin',
  SystemStatus: 'Status',
  Keywords: 'Keywords',
  Users: 'Users',
};

export const userTabConfig: Record<string, TabBarConfig> = {
  LiveFeed: {label: userTabLabels.LiveFeed, icon: images.home},
  LeadLog: {label: userTabLabels.LeadLog, icon: images.users},
  KeywordRequest: {label: userTabLabels.KeywordRequest, icon: images.keyword},
  Settings: {label: userTabLabels.Settings, icon: images.senders},
};

export const adminTabConfig: Record<string, TabBarConfig> = {
  AdminConsole: {label: adminTabLabels.AdminConsole, icon: images.setting},
  SystemStatus: {label: adminTabLabels.SystemStatus, icon: images.home},
  Keywords: {label: adminTabLabels.Keywords, icon: images.keyword},
  Users: {label: adminTabLabels.Users, icon: images.users},
};

/** SF Symbols for native UITabBar — PNGs are not auto-scaled on iOS. */
export const userTabIosSymbols: Record<string, IosTabSymbols> = {
  LiveFeed: {inactive: 'house', active: 'house.fill'},
  LeadLog: {inactive: 'person.2', active: 'person.2.fill'},
  KeywordRequest: {inactive: 'text.magnifyingglass', active: 'text.magnifyingglass'},
  Settings: {inactive: 'paperplane', active: 'paperplane.fill'},
};

export const adminTabIosSymbols: Record<string, IosTabSymbols> = {
  AdminConsole: {inactive: 'gearshape', active: 'gearshape.fill'},
  SystemStatus: {inactive: 'house', active: 'house.fill'},
  Keywords: {inactive: 'text.magnifyingglass', active: 'text.magnifyingglass'},
  Users: {inactive: 'person.2', active: 'person.2.fill'},
};

export const iosTabIcon = (symbols: IosTabSymbols) =>
  ({focused}: {focused: boolean}) =>
    ({
      type: 'sfSymbol',
      name: focused ? symbols.active : symbols.inactive,
    }) as const;

/** Android custom tab bar — Image with tint scales correctly in RN. */
export const tabIcon = (source: ImageSourcePropType) =>
  ({
    type: 'image',
    source,
    tinted: true,
  }) as const;
