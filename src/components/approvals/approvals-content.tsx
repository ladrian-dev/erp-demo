"use client";

import { useEffect, useState, useCallback } from "react";
import { useRole } from "@/context/role-context";
import { getExpenses } from "@/lib/actions/approvals";
import type { ExpenseWithUser } from "@/lib/types";
import { DataTable } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ApprovalsContent() {
  const { role, zone, hasPermission } = useRole();
  const [data, setData] = useState<ExpenseWithUser[] | null>(null);

  const loadData = useCallback(async () => {
    if (!hasPermission("module.expenses")) return;
    const expenses = await getExpenses(role, zone ?? undefined);
    setData(expenses);
  }, [role, zone, hasPermission]);

  useEffect(() => {
    if (!hasPermission("module.expenses")) return;
    setData(null);
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData, hasPermission]);

  if (!hasPermission("module.expenses")) {
    return (
      <Card className="flex h-64 items-center justify-center border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          No tienes permisos para ver el Centro de Gastos.
        </p>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return <DataTable data={data} onRefresh={loadData} />;
}
