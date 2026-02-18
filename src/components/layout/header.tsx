"use client";

import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole, type AppRole } from "@/context/role-context";
import { Badge } from "@/components/ui/badge";
import type { Zone } from "@/lib/types";

const pageTitles: Record<string, string> = {
  "/dashboard": "Centro de Control",
  "/expenses": "Centro de Gastos",
  "/finance-ops": "Freemática",
  "/clients": "Clientes",
  "/notifications": "Centro de Alertas",
  "/resources": "Inventario",
  "/admin/users": "Colaboradores",
};

function getPageTitle(pathname: string): string {
  return pageTitles[pathname] ?? "Centro de Control";
}

const roleBadgeMap: Record<string, { label: string; className: string }> = {
  admin: { label: "Administrador", className: "border-blue-200 bg-blue-50 text-blue-700" },
  approver: { label: "Gerente", className: "border-amber-200 bg-amber-50 text-amber-700" },
  employee: { label: "Colaborador", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
};

export function Header() {
  const pathname = usePathname();
  const { role, user, setRole, zone, setZone, zones, isEmployee, roles, roleUsers } = useRole();
  const roleMeta = roles.find((item) => item.key === role);
  const badgeInfo =
    roleBadgeMap[role] ?? {
      label: roleMeta?.name ?? role,
      className: "border-slate-200 bg-slate-50 text-slate-700",
    };
  const roleOptions =
    roles.length > 0
      ? roles
      : [
          { key: "admin", name: "Administrador" },
          { key: "approver", name: "Aprobador" },
          { key: "employee", name: "Empleado" },
        ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-900">
          {getPageTitle(pathname)}
        </h1>
        {/* Zone Filter — visible for admin/approver */}
        {!isEmployee && (
          <Select
            value={zone ?? "__all__"}
            onValueChange={(v) => setZone(v === "__all__" ? null : (v as Zone))}
          >
            <SelectTrigger className="h-8 w-[160px] border-slate-200 bg-white text-xs">
              <MapPin className="mr-1 h-3 w-3 text-slate-400" />
              <SelectValue placeholder="Todas las zonas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">
                <span className="text-slate-500">Todas las zonas</span>
              </SelectItem>
              {zones.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={badgeInfo.className}>
            {badgeInfo.label}
          </Badge>
          <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
            <SelectTrigger className="w-[220px] border-slate-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => {
                const roleUser = roleUsers[option.key];
                const isDisabled = roles.length > 0 && !roleUser;
                return (
                  <SelectItem key={option.key} value={option.key} disabled={isDisabled}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {roleUser?.name ?? option.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {roleUser?.department ?? option.name}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
            {user.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
