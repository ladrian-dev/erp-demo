"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { createUser, updateUser } from "@/lib/actions/users";
import type { RoleCatalogItem, UserFormData } from "@/lib/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  } | null;
  onSuccess: () => void;
  roles: RoleCatalogItem[];
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
  roles,
}: UserDialogProps) {
  const isEditing = !!user;
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<UserFormData>({
    name: "",
    email: "",
    role: "employee",
    department: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      });
    } else {
      setForm({ name: "", email: "", role: "employee", department: "" });
    }
    setErrors({});
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (isEditing) {
        await updateUser(user!.id, form);
        toast.success("Usuario actualizado");
      } else {
        await createUser(form);
        toast.success("Usuario creado");
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Unique constraint")) {
          setErrors({ email: "Este correo ya está registrado" });
        } else {
          toast.error(err.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuario" : "Crear Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza la información y rol del usuario."
              : "Agrega un nuevo usuario a la plataforma."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Juan Pérez"
              className="border-slate-200"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="juan@empresa.com"
              className="border-slate-200"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={form.role}
            onValueChange={(v) =>
              setForm({
                ...form,
                role: v,
              })
            }
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(roles.length > 0
                  ? roles
                  : [
                      { key: "employee", name: "Empleado" },
                      { key: "approver", name: "Aprobador" },
                      { key: "admin", name: "Administrador" },
                    ]
                ).map((role) => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(e) =>
                setForm({ ...form, department: e.target.value })
              }
              placeholder="Ingeniería"
              className="border-slate-200"
            />
            {errors.department && (
              <p className="text-xs text-red-500">{errors.department}</p>
            )}
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
              {isEditing ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
