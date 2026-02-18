"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertStatsBar } from "./alert-stats-bar";
import { AlertCard } from "./alert-card";
import { AlertDetail } from "./alert-detail";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIncidents, getIncidentStats } from "@/lib/actions/incidents";
import type { IncidentItem } from "@/lib/types";
import { useRole } from "@/context/role-context";
import { Card } from "@/components/ui/card";

export function AlertsContent() {
  const { zone: globalZone, hasPermission } = useRole();
  const [incidents, setIncidents] = useState<IncidentItem[] | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getIncidentStats>> | null>(null);
  const [selected, setSelected] = useState<IncidentItem | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadData = useCallback(async () => {
    const filters: { severity?: string; status?: string; zone?: string } = {};
    if (filterSeverity !== "all") filters.severity = filterSeverity;
    if (filterStatus !== "all") filters.status = filterStatus;
    if (globalZone) filters.zone = globalZone;

    const [inc, st] = await Promise.all([
      getIncidents(filters),
      getIncidentStats(globalZone ?? undefined),
    ]);
    setIncidents(inc);
    setStats(st);
    // If selected incident is no longer in list, deselect
    if (selected && !inc.find((i) => i.id === selected.id)) {
      setSelected(null);
    }
  }, [filterSeverity, filterStatus, globalZone, selected]);

  useEffect(() => {
    if (!hasPermission("module.notifications")) return;
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData, hasPermission]);

  if (!hasPermission("module.notifications")) {
    return (
      <Card className="flex h-64 items-center justify-center border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          No tienes permisos para ver el Centro de Alertas.
        </p>
      </Card>
    );
  }

  if (!incidents || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-[500px] rounded-xl lg:col-span-2" />
          <Skeleton className="h-[500px] rounded-xl lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AlertStatsBar stats={stats} />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[160px] border-slate-200">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Medio</SelectItem>
            <SelectItem value="low">Bajo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] border-slate-200">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="assigned">Asignado</SelectItem>
            <SelectItem value="in_progress">En Progreso</SelectItem>
            <SelectItem value="resolved">Resuelto</SelectItem>
            <SelectItem value="dismissed">Descartado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Split layout */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Alert list */}
        <div className="space-y-2 lg:col-span-2">
          {incidents.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <p className="text-sm text-slate-400">No se encontraron alertas</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <AlertCard
                key={incident.id}
                incident={incident}
                isSelected={selected?.id === incident.id}
                onClick={() => setSelected(incident)}
              />
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <AlertDetail incident={selected} onActionComplete={loadData} />
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white">
              <p className="text-sm text-slate-400">Selecciona una alerta para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
