export interface Organization {
  id: number;
  name: string;
  slug: string;
  status: string;
  plan: string;
  createdAt: string;
  deletedAt?: string | null;
}

export interface OrganizationListMeta {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}
