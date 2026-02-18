"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ExpenseWithUser } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<ExpenseWithUser>[] = [
  {
    accessorKey: "userName",
    header: "Empleado",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-slate-900">
          {row.original.userName}
        </p>
        <p className="text-xs text-slate-400">{row.original.userDepartment}</p>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Concepto",
    cell: ({ row }) => (
      <p className="max-w-[200px] truncate text-sm text-slate-700">
        {row.original.title}
      </p>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Monto
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-slate-900">
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => (
      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
        {row.original.category}
      </span>
    ),
  },
  {
    accessorKey: "project",
    header: "Proyecto",
    cell: ({ row }) => (
      <span className="text-sm text-slate-600">{row.original.project}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "level",
    header: "Nivel",
    cell: ({ row }) => (
      <StatusBadge status={row.original.level} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-slate-500">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];
