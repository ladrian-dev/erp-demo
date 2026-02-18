"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { RoleCatalogItem, UserItem } from "@/lib/types";
import { deleteUser } from "@/lib/actions/users";
import { formatDate } from "@/lib/format";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const roleBadgeStyles: Record<string, string> = {
  admin: "border-blue-200 bg-blue-50 text-blue-700",
  approver: "border-amber-200 bg-amber-50 text-amber-700",
  employee: "border-slate-200 bg-slate-50 text-slate-600",
};

interface UserTableProps {
  data: UserItem[];
  onEdit: (user: UserItem) => void;
  onRefresh: () => void;
  roles: RoleCatalogItem[];
}

export function UserTable({ data, onEdit, onRefresh, roles }: UserTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const roleMap = new Map(roles.map((role) => [role.key, role]));

  async function handleDelete(user: UserItem) {
    if (user._count.expenses > 0) {
      toast.error("No se puede eliminar", {
        description: "Este usuario tiene gastos asociados.",
      });
      return;
    }

    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      toast.success("Usuario eliminado");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar usuario");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="text-xs font-medium text-slate-400">
              Usuario
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Rol
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Departamento
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Gastos
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Aprobados
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Alta
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <TableRow key={user.id} className="border-slate-100">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      roleBadgeStyles[user.role] ??
                      "border-slate-200 bg-slate-50 text-slate-600"
                    }
                  >
                    {roleMap.get(user.role)?.name ?? user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {user.department}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {user._count.expenses}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {user._count.approvedExpenses}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                      onClick={() => onEdit(user)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                    >
                      {deletingId === user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
