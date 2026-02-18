"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ClientItem } from "@/lib/types";
import { Wind, Sun, Users, Truck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClientsTableProps {
  data: ClientItem[];
  onRowClick: (client: ClientItem) => void;
}

export function ClientsTable({ data, onRowClick }: ClientsTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="text-xs font-medium text-slate-400">Planta</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Zona</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Tipo</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Estado</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Contacto</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Guardias</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Vehículos</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Incidentes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-sm text-slate-400">
                No se encontraron clientes.
              </TableCell>
            </TableRow>
          ) : (
            data.map((client) => (
              <TableRow
                key={client.id}
                className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50"
                onClick={() => onRowClick(client)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      {client.siteType === "Eolica" ? (
                        <Wind className="h-4 w-4 text-sky-500" />
                      ) : (
                        <Sun className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{client.siteName}</p>
                      <p className="text-xs text-slate-400">{client.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{client.zone}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {client.siteType === "Eolica" ? "Eólica" : "Solar"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={client.contractStatus} />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-slate-700">{client.contactName}</p>
                    <p className="text-xs text-slate-400">{client.contactEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Users className="h-3 w-3" /> {client.guardCount}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Truck className="h-3 w-3" /> {client.vehicleCount}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <AlertTriangle className="h-3 w-3" /> {client.incidentCount}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

