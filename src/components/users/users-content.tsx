"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";
import { UserTable } from "./user-table";
import { UserDialog } from "./user-dialog";
import { RolesSection } from "./roles-section";
import { getUsers } from "@/lib/actions/users";
import type { UserItem } from "@/lib/types";
import { useRole } from "@/context/role-context";
import { Card } from "@/components/ui/card";

export function UsersContent() {
  const { roles, refreshRoles, hasPermission } = useRole();
  const [users, setUsers] = useState<UserItem[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const loadUsers = useCallback(async () => {
    const data = await getUsers();
    setUsers(data);
    await refreshRoles();
  }, [refreshRoles]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleEdit(user: UserItem) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  if (!hasPermission("module.admin.users")) {
    return (
      <Card className="flex h-64 items-center justify-center border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          No tienes permisos para administrar usuarios.
        </p>
      </Card>
    );
  }

  if (!users) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      <UserTable data={users} onEdit={handleEdit} onRefresh={loadUsers} roles={roles} />

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSuccess={loadUsers}
        roles={roles}
      />

      <RolesSection />
    </div>
  );
}
