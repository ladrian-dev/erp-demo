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
import type { VehicleItem } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Truck } from "lucide-react";

interface VehiclesTableProps {
  data: VehicleItem[];
  onRowClick?: (vehicle: VehicleItem) => void;
}

export function VehiclesTable({ data, onRowClick }: VehiclesTableProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="text-xs font-medium text-slate-400">Vehículo</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Placas</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Estado</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Propiedad</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Kilometraje</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Asignado a</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Último Servicio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((vehicle) => (
            <TableRow
              key={vehicle.id}
              className={`border-slate-100 ${onRowClick ? "cursor-pointer transition-colors hover:bg-slate-50" : ""}`}
              onClick={() => onRowClick?.(vehicle)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Truck className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-slate-400">{vehicle.year}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm text-slate-700">
                {vehicle.licensePlate}
              </TableCell>
              <TableCell>
                <StatusBadge status={vehicle.status} />
              </TableCell>
              <TableCell>
                <StatusBadge status={vehicle.ownership} />
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {vehicle.mileage.toLocaleString()} km
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {vehicle.assignedTo ?? "Sin asignar"}
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                {vehicle.lastService ? formatDate(vehicle.lastService) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
