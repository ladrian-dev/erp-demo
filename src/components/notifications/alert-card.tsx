"use client";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import type { IncidentItem } from "@/lib/types";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

interface AlertCardProps {
  incident: IncidentItem;
  isSelected: boolean;
  onClick: () => void;
}

const severityIcons: Record<string, typeof AlertTriangle> = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
};

const severityColors: Record<string, string> = {
  critical: "border-l-red-500 bg-red-50/50",
  high: "border-l-orange-400",
  medium: "border-l-amber-400",
  low: "border-l-slate-300",
};

const typeLabels: Record<string, string> = {
  intrusion: "Intrusión",
  equipment_failure: "Falla de Equipo",
  weather_alert: "Alerta Meteorológica",
  medical: "Emergencia Médica",
  panic_button: "Botón de Pánico",
  access_violation: "Acceso No Autorizado",
};

export function AlertCard({ incident, isSelected, onClick }: AlertCardProps) {
  const Icon = severityIcons[incident.severity] ?? Info;

  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border border-l-4 bg-white p-3 transition-all hover:shadow-sm",
        severityColors[incident.severity],
        isSelected && "ring-2 ring-slate-900 ring-offset-1"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            incident.severity === "critical" ? "text-red-600" :
            incident.severity === "high" ? "text-orange-500" :
            incident.severity === "medium" ? "text-amber-500" : "text-slate-400"
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{incident.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {incident.clientSiteName} · {typeLabels[incident.type] ?? incident.type}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={incident.status} />
            <span className="text-[11px] text-slate-400">
              {formatRelativeDate(incident.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

