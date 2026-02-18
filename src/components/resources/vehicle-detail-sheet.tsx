"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { VehicleDetail } from "@/lib/types";
import { Truck, MapPin, Gauge, Fuel, Calendar, User, Wrench, ShieldCheck } from "lucide-react";

interface VehicleDetailSheetProps {
  vehicle: VehicleDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventTypeLabels: Record<string, string> = {
  mantenimiento: "Mantenimiento",
  combustible: "Combustible",
  checkpoint: "Checkpoint",
  cambio_aceite: "Cambio de Aceite",
  revision: "Revisión",
  incidente: "Incidente",
};

const eventTypeColors: Record<string, string> = {
  mantenimiento: "bg-blue-500",
  combustible: "bg-amber-500",
  checkpoint: "bg-emerald-500",
  cambio_aceite: "bg-violet-500",
  revision: "bg-sky-500",
  incidente: "bg-red-500",
};

export function VehicleDetailSheet({ vehicle, open, onOpenChange }: VehicleDetailSheetProps) {
  if (!vehicle) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] overflow-y-auto sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5 text-slate-500" />
            {vehicle.make} {vehicle.model} {vehicle.year}
          </SheetTitle>
          <SheetDescription>{vehicle.licensePlate}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and ownership */}
          <div className="flex items-center gap-2">
            <StatusBadge status={vehicle.status} />
            <StatusBadge status={vehicle.ownership} />
          </div>

          <Separator />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {vehicle.vinNumber && (
              <div>
                <p className="text-xs font-medium text-slate-400">VIN</p>
                <p className="font-mono text-xs text-slate-700">{vehicle.vinNumber}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Kilometraje</p>
                <p className="text-sm font-medium text-slate-700">{vehicle.mileage.toLocaleString()} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Combustible</p>
                <p className="text-sm font-medium text-slate-700">{vehicle.fuelType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Último Servicio</p>
                <p className="text-sm font-medium text-slate-700">
                  {vehicle.lastService ? formatDate(vehicle.lastService) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Conductor</p>
                <p className="text-sm font-medium text-slate-700">
                  {vehicle.assignedTo ?? "Sin asignar"}
                </p>
              </div>
            </div>
            {vehicle.clientName && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Cliente</p>
                  <p className="text-sm font-medium text-slate-700">{vehicle.clientName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Mini map */}
          {vehicle.lat && vehicle.lng && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-slate-400">Ubicación Actual</p>
                <div className="mt-2 relative h-[120px] overflow-hidden rounded-lg bg-slate-100">
                  <div className="absolute left-3 top-3 rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-400 backdrop-blur-sm">
                    {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <MapPin className="h-6 w-6 text-red-500" fill="currentColor" strokeWidth={1.5} stroke="white" />
                  </div>
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(5)].map((_, i) => (
                      <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-slate-300" style={{ top: `${(i + 1) * 16.7}%` }} />
                    ))}
                    {[...Array(5)].map((_, i) => (
                      <div key={`v-${i}`} className="absolute bottom-0 top-0 border-l border-slate-300" style={{ left: `${(i + 1) * 16.7}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* History Timeline */}
          <Separator />
          <div>
            <p className="text-xs font-medium text-slate-400">Historial del Vehículo</p>
            <div className="mt-3 space-y-0">
              {vehicle.logs.length === 0 ? (
                <p className="text-sm text-slate-400">Sin registros</p>
              ) : (
                vehicle.logs.map((log, i) => (
                  <div key={log.id} className="flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${eventTypeColors[log.eventType] ?? "bg-slate-400"}`} />
                      {i < vehicle.logs.length - 1 && (
                        <div className="w-0.5 flex-1 bg-slate-200" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-700">
                          {eventTypeLabels[log.eventType] ?? log.eventType}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{log.description}</p>
                      <div className="mt-1 flex gap-3 text-[10px] text-slate-400">
                        {log.mileageAtEvent && <span>{log.mileageAtEvent.toLocaleString()} km</span>}
                        {log.cost && <span>{formatCurrency(log.cost)}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

