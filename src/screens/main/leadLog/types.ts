import type {FeedSeverityLevel} from '../../api/types/user';

export type UserRole = 'admin' | 'user';

export type UserPresenceStatus = 'online' | 'away' | 'offline';

export type UserRecord = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  counties: string[];
  lastSeenAt: string | null;
  activeSessionCount: number;
  presenceStatus: UserPresenceStatus;
  /** null or [] = all severities; non-empty = restricted */
  allowedSeverities: FeedSeverityLevel[] | null;
};

export type RoleFilter = 'All Roles' | 'Admin' | 'User';

export type EditUserTab = 'details' | 'counties';

export const ROLE_OPTIONS: {value: UserRole; label: string}[] = [
  {value: 'admin', label: 'Admin'},
  {value: 'user', label: 'User'},
];

export const ALL_COUNTIES = [
  {name: 'Travis', code: 'TX-TRA', state: 'Texas'},
  {name: 'Wilco', code: 'TX-WIL', state: 'Texas'},
  {name: 'McLennan', code: 'TX-MCL', state: 'Texas'},
  {name: 'Harris', code: 'TX-HAR', state: 'Texas'},
  {name: 'Dallas', code: 'TX-DAL', state: 'Texas'},
  {name: 'Bexar', code: 'TX-BEX', state: 'Texas'},
];
