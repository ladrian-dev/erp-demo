"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { SpendByZoneChart } from "./spend-zone-chart";
import { IncidentSeverityChart } from "./incident-severity-chart";
import { KpiCard } from "./kpi-card";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { getAdminDashboardData } from "@/lib/actions/dashboard";
import Link from "next/link";
import { useRole } from "@/context/role-context";
import {
  Users,
  AlertTriangle,
  Building,
  DollarSign,
  Truck,
  ArrowUpDown,
} from "lucide-react";

export function AdminDashboard() {
  const { zone } = useRole();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getAdminDashboardData>
  > | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const next = await getAdminDashboardData(zone ?? undefined);
      if (active) setData(next);
    };
    setData(null);
    load();
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [zone]);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row - 6 cards, 2 rows of 3 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Guardias Activos"
          value={String(data.activeGuards)}
          subtitle="Personal en campo"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Incidentes Abiertos"
          value={String(data.openIncidents)}
          subtitle="Pendientes de resolución"
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <KpiCard
          title="Plantas Protegidas"
          value={String(data.activeClients)}
          subtitle="Contratos activos"
          icon={Building}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KpiCard
          title="Gasto Mensual"
          value={formatCurrency(data.monthSpend)}
          subtitle="Aprobado y sincronizado"
          icon={DollarSign}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <KpiCard
          title="Vehículos en Ruta"
          value={String(data.activeVehicles)}
          subtitle="De 13 en flotilla"
          icon={Truck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <KpiCard
          title="Pendientes Freemática"
          value={String(data.pendingSync)}
          subtitle="Listo para sincronizar"
          icon={ArrowUpDown}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendByZoneChart data={data.spendByZone} />
        <IncidentSeverityChart data={data.incidentsBySeverity} />
      </div>

      {/* Bottom Row - Alerts and Expenses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">
              Alertas Recientes
            </CardTitle>
            <Link href="/notifications">
              <Button variant="outline" size="sm">
                Ver Centro de Alertas
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentIncidents.map((incident: { id: string; title: string; severity: string; status: string; clientName: string; createdAt: string }) => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {incident.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {incident.clientName} · {formatRelativeDate(incident.createdAt)}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-1">
                  <StatusBadge status={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-slate-500">
              Gastos Recientes
            </CardTitle>
            <Link href="/expenses">
              <Button variant="outline" size="sm">
                Ver Centro de Gastos
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentExpenses.map((expense: { id: string; title: string; amount: number; status: string; userName: string; clientName: string | null; createdAt: string }) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {expense.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {expense.userName} · {expense.clientName ?? "General"} · {formatRelativeDate(expense.createdAt)}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <StatusBadge status={expense.status} />
                  <span className="text-sm font-semibold text-slate-700">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
