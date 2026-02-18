"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useRole, type AppRole } from "@/context/role-context";
import { PwaHome } from "./pwa-home";
import { PwaExpenses } from "./pwa-expenses";
import { PwaIncidents } from "./pwa-incidents";
import { PwaProfile } from "./pwa-profile";
import { Home, Receipt, AlertTriangle, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type PwaTab = "home" | "expenses" | "incidents" | "profile";

const tabs: { id: PwaTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "expenses", label: "Gastos", icon: Receipt },
  { id: "incidents", label: "Alertas", icon: AlertTriangle },
  { id: "profile", label: "Perfil", icon: User },
];

export function PhoneFrame() {
  const [activeTab, setActiveTab] = useState<PwaTab>("home");
  const { role, setRole, roles, roleUsers, hasPermission } = useRole();
  const roleOptions =
    roles.length > 0
      ? roles
      : [
          { key: "employee", name: "Empleado" },
          { key: "approver", name: "Aprobador" },
          { key: "admin", name: "Administrador" },
        ];

  const visibleTabs = useMemo(
    () =>
      tabs.filter((tab) => {
        if (tab.id === "home") return hasPermission("view.pwa.home");
        if (tab.id === "expenses") return hasPermission("view.pwa.expenses");
        if (tab.id === "incidents") return hasPermission("view.pwa.incidents");
        if (tab.id === "profile") return hasPermission("view.pwa.profile");
        return false;
      }),
    [hasPermission]
  );

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [activeTab, visibleTabs]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
      {/* Role switcher floating above phone */}
      <div className="fixed left-6 top-6 z-50 flex items-center gap-3">
        <Badge className="bg-emerald-600 text-white">Modo Colaborador</Badge>
        <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
          <SelectTrigger className="w-[220px] border-zinc-700 bg-zinc-800 text-sm text-white">
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

      {/* Phone shell */}
      <div className="relative w-[390px] overflow-hidden rounded-[44px] border-[8px] border-zinc-700 bg-white shadow-2xl">
        {/* Status bar */}
        <div className="flex h-12 items-center justify-between bg-zinc-900 px-6 text-white">
          <span className="text-xs font-medium">9:41</span>
          {/* Notch */}
          <div className="absolute left-1/2 top-0 h-7 w-28 -translate-x-1/2 rounded-b-2xl bg-zinc-700" />
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              <div className="h-2.5 w-1 rounded-sm bg-white" />
              <div className="h-3 w-1 rounded-sm bg-white" />
              <div className="h-3.5 w-1 rounded-sm bg-white" />
              <div className="h-4 w-1 rounded-sm bg-white" />
            </div>
            <span className="ml-1 text-xs">5G</span>
            <div className="ml-1 h-3 w-5 rounded-sm border border-white">
              <div className="m-0.5 h-1.5 w-3 rounded-sm bg-white" />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="h-[720px] overflow-y-auto bg-slate-50">
          {activeTab === "home" && hasPermission("view.pwa.home") && <PwaHome />}
          {activeTab === "expenses" && hasPermission("view.pwa.expenses") && <PwaExpenses />}
          {activeTab === "incidents" && hasPermission("view.pwa.incidents") && <PwaIncidents />}
          {activeTab === "profile" && hasPermission("view.pwa.profile") && <PwaProfile />}
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-around border-t border-slate-200 bg-white pb-5 pt-2">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 transition-colors",
                  isActive ? "text-slate-900" : "text-slate-400"
                )}
              >
                <tab.icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
