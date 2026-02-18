"use client";

import { useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { columns } from "./columns";
import { ExpenseDetailSheet } from "./expense-detail-sheet";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { approveExpense, rejectExpense } from "@/lib/actions/approvals";
import type { ExpenseWithUser } from "@/lib/types";
import { useRole } from "@/context/role-context";

interface DataTableProps {
  data: ExpenseWithUser[];
  onRefresh: () => void;
}

export function DataTable({ data, onRefresh }: DataTableProps) {
  const { user, hasPermission } = useRole();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithUser | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleQuickApprove = useCallback(
    async (e: React.MouseEvent, expense: ExpenseWithUser) => {
      if (!hasPermission("action.expenses.approve")) {
        toast.error("No tienes permiso para aprobar gastos");
        return;
      }
      e.stopPropagation();
      setActionLoading(`approve-${expense.id}`);
      try {
        await approveExpense(expense.id, user.id);
        toast.success("Aprobado", { description: expense.title });
        onRefresh();
      } catch {
        toast.error("Error al aprobar");
      } finally {
        setActionLoading(null);
      }
    },
    [user.id, onRefresh, hasPermission]
  );

  const handleQuickReject = useCallback(
    async (e: React.MouseEvent, expense: ExpenseWithUser) => {
      if (!hasPermission("action.expenses.reject")) {
        toast.error("No tienes permiso para rechazar gastos");
        return;
      }
      e.stopPropagation();
      setActionLoading(`reject-${expense.id}`);
      try {
        await rejectExpense(expense.id, user.id);
        toast.success("Rechazado", { description: expense.title });
        onRefresh();
      } catch {
        toast.error("Error al rechazar");
      } finally {
        setActionLoading(null);
      }
    },
    [user.id, onRefresh, hasPermission]
  );

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar gastos..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm border-slate-200"
        />
        <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string[])?.join(",") ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? undefined : value.split(","))
          }
        >
          <SelectTrigger className="w-[180px] border-slate-200">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="approved">Aprobado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
            <SelectItem value="synced">Sincronizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium text-slate-400"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
                <TableHead className="text-xs font-medium text-slate-400">
                  Acciones
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50"
                  onClick={() => {
                    setSelectedExpense(row.original);
                    setSheetOpen(true);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="py-3">
                    {row.original.status === "pending" && (hasPermission("action.expenses.approve") || hasPermission("action.expenses.reject")) && (
                      <div className="flex gap-1">
                        {hasPermission("action.expenses.approve") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            onClick={(e) => handleQuickApprove(e, row.original)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === `approve-${row.original.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {hasPermission("action.expenses.reject") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={(e) => handleQuickReject(e, row.original)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === `reject-${row.original.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center text-sm text-slate-400"
                >
                  No se encontraron gastos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {table.getFilteredRowModel().rows.length} gasto(s) en total
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-500">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Panel de detalle */}
      <ExpenseDetailSheet
        expense={selectedExpense}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onActionComplete={onRefresh}
      />
    </div>
  );
}
