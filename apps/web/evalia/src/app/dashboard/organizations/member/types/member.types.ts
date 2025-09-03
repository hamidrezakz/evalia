export interface OrgMember {
  id: number;
  userId: number;
  organizationId: number;
  role: string;
  createdAt: string;
}

export interface OrgMemberListMeta {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}
