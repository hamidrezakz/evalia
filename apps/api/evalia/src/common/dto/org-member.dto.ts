export class OrgMemberDto {
  id!: number; // membership id
  userId!: number;
  role!: string;
  fullName?: string | null;
  email?: string | null;
  createdAt!: Date;

  static from(m: any): OrgMemberDto {
    const d = new OrgMemberDto();
    d.id = m.id;
    d.userId = m.userId;
    d.role = m.role;
    d.fullName = m.user?.fullName;
    d.email = m.user?.email;
    d.createdAt = m.createdAt;
    return d;
  }
}
