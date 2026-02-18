"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatRelativeDate } from "@/lib/format";
import { toast } from "sonner";
import { updateIncidentStatus } from "@/lib/actions/incidents";
import type { IncidentItem } from "@/lib/types";
import { useRole } from "@/context/role-context";
import {
  MapPin,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface AlertDetailProps {
  incident: IncidentItem;
  onActionComplete: () => void;
}

const typeLabels: Record<string, string> = {
  intrusion: "Intrusión",
  equipment_failure: "Falla de Equipo",
  weather_alert: "Alerta Meteorológica",
  medical: "Emergencia Médica",
  panic_button: "Botón de Pánico",
  access_violation: "Acceso No Autorizado",
};

export function AlertDetail({ incident, onActionComplete }: AlertDetailProps) {
  const { hasPermission } = useRole();
  const [loading, setLoading] = useState<string | null>(null);
  const isActionable = ["open", "assigned", "in_progress"].includes(incident.status);

  async function handleStatusChange(status: string, label: string) {
    setLoading(status);
    try {
      await updateIncidentStatus(incident.id, status);
      toast.success(`Alerta ${label.toLowerCase()}`, { description: incident.title });
      onActionComplete();
    } catch {
      toast.error(`Fallo al ${label.toLowerCase()} la alerta`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{incident.title}</CardTitle>
            <p className="text-sm text-slate-500">
              {incident.clientSiteName} · {incident.clientName}
            </p>
          </div>
          <div className="flex gap-1">
            <StatusBadge status={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Type and Zone */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Tipo</p>
            <p className="text-sm font-medium text-slate-700">
              {typeLabels[incident.type] ?? incident.type}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Zona</p>
            <p className="text-sm font-medium text-slate-700">{incident.clientZone}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Fecha</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(incident.createdAt)}</p>
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <p className="text-xs font-medium text-slate-400">Descripción</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{incident.description}</p>
        </div>

        <Separator />

        {/* People */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Reportado por</p>
              <p className="text-sm font-medium text-slate-700">{incident.reportedByName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Asignado a</p>
              <p className="text-sm font-medium text-slate-700">
                {incident.assignedToName ?? "Sin asignar"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          <span>Creado {formatRelativeDate(incident.createdAt)}</span>
          {incident.resolvedAt && (
            <>
              <span>·</span>
              <span>Resuelto {formatDate(incident.resolvedAt)}</span>
            </>
          )}
        </div>

        {/* Actions */}
        {isActionable && hasPermission("action.incidents.update") && (
          <>
            <Separator />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleStatusChange("resolved", "Resuelta")}
                disabled={loading !== null}
              >
                {loading === "resolved" ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                Resolver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange("in_progress", "En progreso")}
                disabled={loading !== null}
              >
                {loading === "in_progress" ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <ArrowUpRight className="mr-1 h-3 w-3" />}
                Escalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-500"
                onClick={() => handleStatusChange("dismissed", "Descartada")}
                disabled={loading !== null}
              >
                {loading === "dismissed" ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <XCircle className="mr-1 h-3 w-3" />}
                Descartar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
