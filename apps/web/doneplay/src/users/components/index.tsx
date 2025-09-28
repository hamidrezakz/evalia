import * as React from "react";
export { UsersList } from "./UsersList";
export { UsersTable } from "./UsersTable";
export { UserStatusBadge } from "./UserStatusBadge";
export { default as UserUpsertDialog } from "./UserUpsertDialog";
export { UsersRowActions } from "./UsersRowActions";

// Optional demo wrapper for quick embedding
const UsersListComp = React.lazy(() =>
  import("./UsersList").then((m) => ({ default: m.UsersList }))
);

export default function UsersComponent() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <div className="container max-w-5xl py-6">
        <UsersListComp />
      </div>
    </React.Suspense>
  );
}
