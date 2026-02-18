"use client";

import { AlertTriangle, AlertCircle, Bell, CheckCircle2 } from "lucide-react";

interface AlertStatsBarProps {
  stats: {
    critical: number;
    high: number;
    open: number;
    resolvedToday: number;
  };
}

export function AlertStatsBar({ stats }: AlertStatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <div>
          <p className="text-lg font-bold text-red-700">{stats.critical}</p>
          <p className="text-xs text-red-600">Críticos</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <div>
          <p className="text-lg font-bold text-orange-700">{stats.high}</p>
          <p className="text-xs text-orange-600">Alta Prioridad</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
        <Bell className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-lg font-bold text-blue-700">{stats.open}</p>
          <p className="text-xs text-blue-600">Abiertos</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="text-lg font-bold text-emerald-700">{stats.resolvedToday}</p>
          <p className="text-xs text-emerald-600">Resueltos Hoy</p>
        </div>
      </div>
    </div>
  );
}

