export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}
