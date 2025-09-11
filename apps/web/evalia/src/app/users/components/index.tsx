export { UsersList } from "./UsersList";
export { UsersTable } from "./UsersTable";
export { UserDetailSheet } from "./UserDetailSheet";
export { UserStatusBadge } from "./UserStatusBadge";
export { UsersRowActions } from "./UsersRowActions";

// Optional demo wrapper for quick embedding
export default function UsersComponent() {
  const UsersListComp = await import("./UsersList");
    .UsersList as typeof import("./UsersList").UsersList;
  return (
    <div className="container max-w-5xl py-6">
      <UsersListComp />
    </div>
  );
}
