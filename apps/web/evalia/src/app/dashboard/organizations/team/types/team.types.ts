export interface Team {
  id: number;
  name: string;
  organizationId: number;
  createdAt: string;
  deletedAt?: string | null;
}

export interface TeamListMeta {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}
