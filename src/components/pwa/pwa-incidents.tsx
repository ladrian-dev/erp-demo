"use client";

import { useCallback, useEffect, useState } from "react";
import { useRole } from "@/context/role-context";
import { StatusBadge } from "@/components/shared/status-badge";
import { MapPin, Plus, X, AlertTriangle, Shield, Zap, Wind } from "lucide-react";
import { toast } from "sonner";
import { createIncident, getUserIncidents } from "@/lib/actions/incidents";
import type { UserIncidentItem } from "@/lib/types";
import { formatRelativeDate } from "@/lib/format";

const typeOptions = [
  { value: "intrusion", label: "Intrusion", icon: Shield },
  { value: "equipment_failure", label: "Falla de Equipo", icon: Zap },
  { value: "weather_alert", label: "Alerta Meteorologica", icon: Wind },
  { value: "access_violation", label: "Acceso No Autorizado", icon: AlertTriangle },
];

export function PwaIncidents() {
  const { user, hasPermission } = useRole();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("intrusion");
  const [formDescription, setFormDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [incidents, setIncidents] = useState<UserIncidentItem[] | null>(null);

  const canView = hasPermission("view.pwa.incidents");
  const canCreate = hasPermission("action.incidents.create");

  const loadIncidents = useCallback(async () => {
    if (!canView || !user.id) return;
    try {
      const data = await getUserIncidents(user.id);
      setIncidents(data);
    } catch {
      setIncidents([]);
    }
  }, [canView, user.id]);

  useEffect(() => {
    if (!canView) return;
    loadIncidents();
    const interval = setInterval(loadIncidents, 8000);
    return () => clearInterval(interval);
  }, [loadIncidents, canView]);

  async function handleSubmit() {
    if (!canCreate) {
      toast.error("No tienes permisos para reportar incidentes");
      return;
    }

    setIsSending(true);
    try {
      await createIncident({
        title: `Reporte de campo — ${typeOptions.find((t) => t.value === formType)?.label}`,
        type: formType,
        severity: "medium",
        description:
          formDescription.trim() ||
          `Reporte generado desde la aplicacion movil por ${user.name}.`,
        clientId: "client-001",
        reportedById: user.id,
      });
      toast.success("Incidente reportado", {
        description: "Se ha notificado a la central de monitoreo.",
      });
      setShowForm(false);
      setFormDescription("");
      loadIncidents();
    } catch {
      toast.error("Error al reportar incidente");
    } finally {
      setIsSending(false);
    }
  }

  if (!canView) {
    return (
      <div className="p-4">
        <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No tienes permisos para ver alertas.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Incidencias</h2>
        {canCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-all active:scale-95"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-4 space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Reportar Incidente</p>

          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormType(opt.value)}
                className={`flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition-all ${
                  formType === opt.value
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <opt.icon className="h-4 w-4 shrink-0" />
                {opt.label}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Describe la situacion..."
            rows={3}
            value={formDescription}
            onChange={(event) => setFormDescription(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">
            <MapPin className="h-3 w-3" />
            <span>Ubicacion: Parque Eolico Reynosa — 26.0508, -98.2279</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSending}
            className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSending ? "Enviando..." : "Reportar Incidente"}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-slate-400">Mis Reportes</p>
        {incidents?.map((incident) => (
          <div
            key={incident.id}
            className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{incident.title}</p>
              <p className="text-[11px] text-slate-400">
                {formatRelativeDate(incident.createdAt)}
              </p>
            </div>
            <div className="ml-2 flex items-center gap-1">
              <StatusBadge status={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
          </div>
        ))}
        {incidents?.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            Aun no has reportado incidencias.
          </div>
        )}
        {!incidents && (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
            Cargando alertas...
          </div>
        )}
      </div>
    </div>
  );
}
