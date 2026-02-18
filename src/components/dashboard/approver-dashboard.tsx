"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "./kpi-card";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { getApproverDashboardData } from "@/lib/actions/dashboard";
import { useRole } from "@/context/role-context";
import Link from "next/link";
import { Inbox, DollarSign, CheckCircle2 } from "lucide-react";

export function ApproverDashboard() {
  const { user, zone } = useRole();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getApproverDashboardData>
  > | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const next = await getApproverDashboardData(user.id, zone ?? undefined);
      if (active) setData(next);
    };
    setData(null);
    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user.id, zone]);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Aprobaciones Pendientes"
          value={String(data.pendingApprovals)}
          subtitle="Esperando tu revisión"
          icon={Inbox}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <KpiCard
          title="Gasto del Equipo (Mes)"
          value={formatCurrency(data.teamSpendThisMonth)}
          subtitle="Nivel 1 aprobado"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KpiCard
          title="Aprobados Este Mes"
          value={String(data.approvedThisMonth)}
          subtitle="Por ti"
          icon={CheckCircle2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-slate-500">
            Solicitudes Pendientes
          </CardTitle>
          <Link href="/expenses">
            <Button variant="outline" size="sm">
              Ver Todas
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="mb-2 h-10 w-10 text-emerald-300" />
              <p className="text-sm font-medium text-slate-500">¡Todo al día!</p>
              <p className="text-xs text-slate-400">
                No hay aprobaciones pendientes en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentPending.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {expense.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {expense.userName} · {expense.department} ·{" "}
                      {formatRelativeDate(expense.createdAt)}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-3">
                    <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-500">
                      {expense.category}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
