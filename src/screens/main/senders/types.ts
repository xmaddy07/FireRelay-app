export type SenderStatus = 'active' | 'inactive' | 'disabled';

export type SenderRecord = {
  id: string;
  name: string;
  email?: string;
  domain?: string;
  status: SenderStatus;
  token: string;
  description?: string;
  createdAt: string;
};

export type StatusFilter = 'All Status' | 'Active' | 'Inactive' | 'Disabled';

export const STATUS_FILTER_OPTIONS: StatusFilter[] = [
  'All Status',
  'Active',
  'Inactive',
  'Disabled',
];

export const SENDERS_PAGE_SIZE = 10;
