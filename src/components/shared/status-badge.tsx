import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  // Expense statuses
  pending: { label: "Pendiente", className: "border-amber-200 bg-amber-50 text-amber-700" },
  approved: { label: "Aprobado", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Rechazado", className: "border-red-200 bg-red-50 text-red-700" },
  synced: { label: "Sincronizado", className: "border-blue-200 bg-blue-50 text-blue-700" },
  // Asset / Vehicle statuses
  active: { label: "Activo", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  maintenance: { label: "Mantenimiento", className: "border-amber-200 bg-amber-50 text-amber-700" },
  retired: { label: "Retirado", className: "border-slate-200 bg-slate-50 text-slate-500" },
  out_of_service: { label: "Fuera de Servicio", className: "border-red-200 bg-red-50 text-red-700" },
  // Expense levels
  level_1: { label: "Nivel 1", className: "border-slate-200 bg-slate-50 text-slate-600" },
  executive: { label: "Ejecutivo", className: "border-violet-200 bg-violet-50 text-violet-700" },
  // Vehicle ownership
  propio: { label: "Propio", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  arrendamiento: { label: "Arrendamiento", className: "border-blue-200 bg-blue-50 text-blue-700" },
  // Contract status
  expired: { label: "Expirado", className: "border-red-200 bg-red-50 text-red-700" },
  // Incident statuses
  open: { label: "Abierto", className: "border-red-200 bg-red-50 text-red-700" },
  assigned: { label: "Asignado", className: "border-amber-200 bg-amber-50 text-amber-700" },
  in_progress: { label: "En Progreso", className: "border-blue-200 bg-blue-50 text-blue-700" },
  resolved: { label: "Resuelto", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  dismissed: { label: "Descartado", className: "border-slate-200 bg-slate-50 text-slate-500" },
  // Incident severity
  critical: { label: "Crítico", className: "border-red-300 bg-red-100 text-red-800 font-semibold" },
  high: { label: "Alto", className: "border-orange-200 bg-orange-50 text-orange-700" },
  medium: { label: "Medio", className: "border-amber-200 bg-amber-50 text-amber-700" },
  low: { label: "Bajo", className: "border-slate-200 bg-slate-50 text-slate-600" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-[11px]", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
