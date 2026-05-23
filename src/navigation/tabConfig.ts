import type {ImageSourcePropType} from 'react-native';
import type {SFSymbol} from 'sf-symbols-typescript';
import {images} from '../config/constants';

export type TabBarConfig = {
  label: string;
  icon: ImageSourcePropType;
};

type IosTabSymbols = {
  inactive: SFSymbol;
  active: SFSymbol;
};

export const MAIN_TAB_ROUTES = [
  'Feed',
  'LeadLog',
  'Keywords',
  'Settings',
] as const;

export type MainTabRoute = (typeof MAIN_TAB_ROUTES)[number];

export const USER_TAB_ROUTES = ['Feed', 'Settings'] as const satisfies readonly MainTabRoute[];

export const getVisibleTabRoutes = (isAdmin: boolean): MainTabRoute[] =>
  isAdmin ? [...MAIN_TAB_ROUTES] : [...USER_TAB_ROUTES];

export const MAIN_TAB_LABELS: Record<MainTabRoute, string> = {
  Feed: 'Live Feed',
  LeadLog: 'Lead Log',
  Keywords: 'Keywords',
  Settings: 'Settings',
};

export const getMainTabLabels = (): Record<MainTabRoute, string> => MAIN_TAB_LABELS;

export const getMainTabConfig = (): Record<MainTabRoute, TabBarConfig> => ({
  Feed: {label: MAIN_TAB_LABELS.Feed, icon: images.home},
  LeadLog: {label: MAIN_TAB_LABELS.LeadLog, icon: images.users},
  Keywords: {label: MAIN_TAB_LABELS.Keywords, icon: images.keyword},
  Settings: {label: MAIN_TAB_LABELS.Settings, icon: images.senders},
});

export const getMainTabIosSymbols = (): Record<MainTabRoute, IosTabSymbols> => ({
  Feed: {inactive: 'house', active: 'house.fill'},
  LeadLog: {inactive: 'person.2', active: 'person.2.fill'},
  Keywords: {
    inactive: 'text.magnifyingglass',
    active: 'text.magnifyingglass',
  },
  Settings: {inactive: 'paperplane', active: 'paperplane.fill'},
});

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
