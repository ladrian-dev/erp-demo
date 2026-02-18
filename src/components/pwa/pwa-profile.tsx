"use client";

import { useRole, type AppRole } from "@/context/role-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, MapPin, Truck, Clock, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PwaProfile() {
  const { user, role, setRole, roles, roleUsers } = useRole();
  const roleOptions =
    roles.length > 0
      ? roles
      : [
          { key: "employee", name: "Empleado" },
          { key: "approver", name: "Aprobador" },
          { key: "admin", name: "Administrador" },
        ];

  return (
    <div className="p-4">
      {/* Profile header */}
      <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-sm">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-slate-900 text-lg font-bold text-white">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <h2 className="mt-3 text-lg font-bold text-slate-900">{user.name}</h2>
        <p className="text-sm text-slate-500">{user.department}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
          <Shield className="h-3 w-3" />
          <span>SecurOps</span>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Planta Asignada</p>
          <div className="mt-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Parque Eólico Reynosa</p>
              <p className="text-xs text-slate-400">Tamaulipas, Zona Norte</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Vehículo Asignado</p>
          <div className="mt-2 flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">Toyota Hilux SR 2023</p>
              <p className="text-xs text-slate-400">NLD-1234 · 24,500 km</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Horario de Guardia</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Turno Nocturno</p>
                <p className="text-xs text-slate-400">22:00 — 06:00</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">Lun — Vie</p>
                <p className="text-xs text-slate-400">Descanso: Sáb y Dom</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Switch role */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium text-slate-400">Cambiar Vista</p>
        <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
          <SelectTrigger className="border-slate-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => {
              const roleUser = roleUsers[option.key];
              const isDisabled = roles.length > 0 && !roleUser;
              return (
                <SelectItem key={option.key} value={option.key} disabled={isDisabled}>
                  {roleUser?.name ?? option.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
