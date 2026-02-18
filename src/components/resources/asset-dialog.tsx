"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAsset,
  updateAsset,
  getUsersForAssignment,
} from "@/lib/actions/resources";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { AssetItem, AssetFormData } from "@/lib/types";

interface AssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: AssetItem | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Radio",
  "CCTV",
  "Dron",
  "Chaleco",
  "Linterna",
  "Laptop",
  "GPS",
  "Visión Nocturna",
  "Cámara Corporal",
];

export function AssetDialog({
  open,
  onOpenChange,
  asset,
  onSuccess,
}: AssetDialogProps) {
  const isEditing = !!asset;
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<AssetFormData>({
    name: "",
    category: "Radio",
    serialNumber: "",
    status: "active",
    location: "",
    value: 0,
    purchaseDate: new Date().toISOString().split("T")[0],
    assignedToId: "",
  });

  useEffect(() => {
    getUsersForAssignment().then(setUsers);
  }, []);

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        category: asset.category,
        serialNumber: asset.serialNumber ?? "",
        status: asset.status as "active" | "maintenance" | "retired",
        location: asset.location,
        value: asset.value,
        purchaseDate: new Date(asset.purchaseDate).toISOString().split("T")[0],
        assignedToId: asset.assignedToId ?? "",
      });
    } else {
      setForm({
        name: "",
        category: "Radio",
        serialNumber: "",
        status: "active",
        location: "",
        value: 0,
        purchaseDate: new Date().toISOString().split("T")[0],
        assignedToId: "",
      });
    }
  }, [asset, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateAsset(asset!.id, form);
        toast.success("Activo actualizado");
      } else {
        await createAsset(form);
        toast.success("Activo creado");
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al guardar activo",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Activo" : "Agregar Activo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información del activo."
              : "Registra un nuevo activo de seguridad."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Radio Motorola DTR720"
              className="border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as AssetFormData["status"] })
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="retired">Retirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>No. Serie</Label>
            <Input
              value={form.serialNumber}
              onChange={(e) =>
                setForm({ ...form, serialNumber: e.target.value })
              }
              placeholder="MOT-DTR-001"
              className="border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label>Ubicación</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Parque Eólico Reynosa"
              className="border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (MXN)</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: Number(e.target.value) })
                }
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Compra</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) =>
                  setForm({ ...form, purchaseDate: e.target.value })
                }
                className="border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asignar a</Label>
            <Select
              value={form.assignedToId || "none"}
              onValueChange={(v) =>
                setForm({ ...form, assignedToId: v === "none" ? "" : v })
              }
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Crear Activo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
