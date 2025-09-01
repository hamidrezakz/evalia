export class TeamMemberDto {
  id!: number; // team membership id
  userId!: number;
  fullName?: string | null;
  email?: string | null;
  createdAt!: Date;

  static from(m: any): TeamMemberDto {
    const d = new TeamMemberDto();
    d.id = m.id;
    d.userId = m.userId;
    d.fullName = m.user?.fullName;
    d.email = m.user?.email;
    d.createdAt = m.createdAt;
    return d;
  }
}
