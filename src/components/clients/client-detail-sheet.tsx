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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ClientDetail } from "@/lib/types";
import { MapPin, Users, Wind, Sun, Mail, Phone } from "lucide-react";

interface ClientDetailSheetProps {
  client: ClientDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailSheet({ client, open, onOpenChange }: ClientDetailSheetProps) {
  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] overflow-y-auto sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            {client.siteType === "Eolica" ? (
              <Wind className="h-5 w-5 text-sky-500" />
            ) : (
              <Sun className="h-5 w-5 text-amber-500" />
            )}
            {client.siteName}
          </SheetTitle>
          <SheetDescription>{client.name}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and Zone */}
          <div className="flex items-center gap-2">
            <StatusBadge status={client.contractStatus} />
            <Badge variant="outline">{client.zone}</Badge>
            <Badge variant="outline" className="text-xs">
              {client.siteType === "Eolica" ? "Eólica" : "Solar"}
            </Badge>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">Contacto del Cliente</p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">{client.contactName}</p>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Mail className="h-3 w-3" /> {client.contactEmail}
              </div>
              {client.contactPhone && (
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Phone className="h-3 w-3" /> {client.contactPhone}
                </div>
              )}
            </div>
            {client.address && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" /> {client.address}
              </div>
            )}
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{client.guardCount}</p>
              <p className="text-xs text-slate-500">Guardias</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{client.vehicleCount}</p>
              <p className="text-xs text-slate-500">Vehículos</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{client.incidentCount}</p>
              <p className="text-xs text-slate-500">Incidentes</p>
            </div>
          </div>

          <Separator />

          {/* Personnel */}
          <div>
            <p className="text-xs font-medium text-slate-400">Personal Asignado</p>
            <div className="mt-2 space-y-2">
              {client.personnel.length === 0 ? (
                <p className="text-sm text-slate-400">Sin personal asignado</p>
              ) : (
                client.personnel.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.department}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {p.role === "admin" ? "Admin" : p.role === "approver" ? "Gerente" : "Colaborador"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Recent Expenses */}
          <div>
            <p className="text-xs font-medium text-slate-400">Gastos Recientes</p>
            <div className="mt-2 space-y-2">
              {client.recentExpenses.length === 0 ? (
                <p className="text-sm text-slate-400">Sin gastos registrados</p>
              ) : (
                client.recentExpenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <div>
                      <p className="text-sm text-slate-700">{e.title}</p>
                      <p className="text-xs text-slate-400">{formatDate(e.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={e.status} />
                      <span className="text-sm font-semibold text-slate-900">
                        {formatCurrency(e.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* Recent Incidents */}
          <div>
            <p className="text-xs font-medium text-slate-400">Incidentes Recientes</p>
            <div className="mt-2 space-y-2">
              {client.recentIncidents.length === 0 ? (
                <p className="text-sm text-slate-400">Sin incidentes registrados</p>
              ) : (
                client.recentIncidents.map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-700">{i.title}</p>
                      <p className="text-xs text-slate-400">{formatDate(i.createdAt)}</p>
                    </div>
                    <div className="ml-2 flex items-center gap-1">
                      <StatusBadge status={i.severity} />
                      <StatusBadge status={i.status} />
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

