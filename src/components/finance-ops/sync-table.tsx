"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { SyncableExpense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

interface SyncTableProps {
  data: SyncableExpense[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function SyncTable({
  data,
  selectedIds,
  onSelectionChange,
}: SyncTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  function toggleAll() {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((e) => e.id));
    }
  }

  function toggleOne(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Empleado
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Concepto
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Monto
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Categoría
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Proyecto
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Aprobado por
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Fecha
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-sm text-slate-400"
              >
                No hay gastos listos para sincronizar.
              </TableCell>
            </TableRow>
          ) : (
            data.map((expense) => (
              <TableRow
                key={expense.id}
                className="border-slate-100 transition-colors hover:bg-slate-50"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(expense.id)}
                    onCheckedChange={() => toggleOne(expense.id)}
                    aria-label={`Seleccionar ${expense.title}`}
                  />
                </TableCell>
                <TableCell className="text-sm text-slate-700">
                  {expense.userName}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-slate-700">
                  {expense.title}
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-900">
                  {formatCurrency(expense.amount)}
                </TableCell>
                <TableCell>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {expense.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {expense.project}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {expense.approverName ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(expense.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
