"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { SyncLogEntry } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

interface SyncHistoryProps {
  data: SyncLogEntry[];
}

export function SyncHistory({ data }: SyncHistoryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="text-xs font-medium text-slate-400">
              Referencia
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Gasto
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Monto
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Estado
            </TableHead>
            <TableHead className="text-xs font-medium text-slate-400">
              Fecha de Sync
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-sm text-slate-400"
              >
                No hay historial de sincronización.
              </TableCell>
            </TableRow>
          ) : (
            data.map((log) => (
              <TableRow key={log.id} className="border-slate-100">
                <TableCell className="font-mono text-xs text-slate-600">
                  {log.reference ?? "—"}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-slate-700">
                  {log.expenseTitle}
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-900">
                  {formatCurrency(log.expenseAmount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={log.status} />
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(log.syncedAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
