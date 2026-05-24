export type QueryValue = string | number | boolean | undefined | null;

export type PaginatedMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type PaginatedResponse<T> = {
  data?: T[];
  items?: T[];
  results?: T[];
  total?: number;
  page?: number;
  limit?: number;
  meta?: PaginatedMeta;
};
