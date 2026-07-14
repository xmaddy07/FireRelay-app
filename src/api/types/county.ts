export type {ApiCounty} from './user';

export type CountyRecord = {
  id: string;
  name: string;
  code: string;
  state: string;
  createdAt: string;
  updatedAt: string;
};

export type CountyActivityStatus = 'live' | 'active' | 'offline';

export type CountyActivityView = {
  status: CountyActivityStatus;
  badgeLabel: string;
  lastActiveLabel: string;
};

export type CountyListItem = CountyRecord & {
  locationLabel: string;
  userCount: number;
  lastActiveAt: string | null;
  activity: CountyActivityView;
};

export type CountyConnectedUser = {
  id: string;
  email: string;
};
