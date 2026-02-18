"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import type { AssetItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteAsset } from "@/lib/actions/resources";
import { toast } from "sonner";
import {
  Radio,
  Camera,
  Plane,
  ShieldCheck,
  Flashlight,
  Laptop,
  MapPin,
  Eye,
  Video,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

const categoryIcons: Record<string, typeof Laptop> = {
  Radio: Radio,
  CCTV: Video,
  Dron: Plane,
  Chaleco: ShieldCheck,
  Linterna: Flashlight,
  Laptop: Laptop,
  GPS: MapPin,
  "Visión Nocturna": Eye,
  "Cámara Corporal": Camera,
};

interface AssetsTableProps {
  data: AssetItem[];
  onEdit: (asset: AssetItem) => void;
  onRefresh: () => void;
  isAdmin: boolean;
}

export function AssetsTable({ data, onEdit, onRefresh, isAdmin }: AssetsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(asset: AssetItem) {
    setDeletingId(asset.id);
    try {
      await deleteAsset(asset.id);
      toast.success("Activo eliminado");
      onRefresh();
    } catch {
      toast.error("Error al eliminar activo");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="text-xs font-medium text-slate-400">Activo</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">No. Serie</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Estado</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Ubicación</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Asignado a</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Valor</TableHead>
            <TableHead className="text-xs font-medium text-slate-400">Fecha Compra</TableHead>
            {isAdmin && <TableHead className="text-xs font-medium text-slate-400">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((asset) => {
            const Icon = categoryIcons[asset.category] ?? Laptop;
            return (
              <TableRow key={asset.id} className="border-slate-100">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{asset.name}</p>
                      <p className="text-xs text-slate-400">{asset.category}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {asset.serialNumber ?? "—"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={asset.status} />
                </TableCell>
                <TableCell className="text-sm text-slate-600">{asset.location}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  {asset.assignedTo ?? "Sin asignar"}
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-900">
                  {formatCurrency(asset.value)}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(asset.purchaseDate)}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                        onClick={() => onEdit(asset)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600"
                        onClick={() => handleDelete(asset)}
                        disabled={deletingId === asset.id}
                      >
                        {deletingId === asset.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
