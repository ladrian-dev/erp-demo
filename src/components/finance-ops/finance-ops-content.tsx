"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyncTable } from "./sync-table";
import { SyncButton } from "./sync-button";
import { SyncHistory } from "./sync-history";
import { Skeleton } from "@/components/ui/skeleton";
import { getApprovedExpenses, getSyncHistory, syncToErp } from "@/lib/actions/erp-sync";
import type { SyncableExpense, SyncLogEntry } from "@/lib/types";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

export function FinanceOpsContent() {
  const [expenses, setExpenses] = useState<SyncableExpense[] | null>(null);
  const [history, setHistory] = useState<SyncLogEntry[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = useCallback(async () => {
    const [exp, hist] = await Promise.all([
      getApprovedExpenses(),
      getSyncHistory(),
    ]);
    setExpenses(exp);
    setHistory(hist);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSync() {
    if (selectedIds.length === 0) return;
    setIsSyncing(true);

    try {
      const result = await syncToErp(selectedIds);
      const totalAmount = expenses
        ?.filter((e) => selectedIds.includes(e.id))
        .reduce((sum, e) => sum + e.amount, 0) ?? 0;

      toast.success(`${result.count} gasto(s) sincronizados a Freemática`, {
        description: `Total: ${formatCurrency(totalAmount)}`,
      });

      setSelectedIds([]);
      await loadData();
    } catch {
      toast.error("Error de sincronización", {
        description: "No se pudo conectar con Freemática. Intenta de nuevo.",
      });
    } finally {
      setIsSyncing(false);
    }
  }

  if (!expenses || !history) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="sync" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="sync">Sincronización ERP</TabsTrigger>
          <TabsTrigger value="history">Historial de Sync</TabsTrigger>
        </TabsList>

        <SyncButton
          selectedCount={selectedIds.length}
          isLoading={isSyncing}
          onClick={handleSync}
        />
      </div>

      <TabsContent value="sync" className="mt-4">
        <SyncTable
          data={expenses}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <SyncHistory data={history} />
      </TabsContent>
    </Tabs>
  );
}
