"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getRoleCatalog } from "@/lib/actions/roles";
import type { RoleCatalogItem } from "@/lib/types";

type RoleContextValue = {
  roles: RoleCatalogItem[];
  refreshRoles: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const fallbackRoles: RoleCatalogItem[] = [
  {
    id: "demo-admin",
    key: "admin",
    name: "Administrador",
    description: "Acceso total al panel",
    isSystem: true,
    permissions: [],
    userCount: 0,
  },
  {
    id: "demo-approver",
    key: "approver",
    name: "Aprobador",
    description: "Aprobacion de gastos y alertas",
    isSystem: true,
    permissions: [],
    userCount: 0,
  },
  {
    id: "demo-employee",
    key: "employee",
    name: "Empleado",
    description: "Acceso a la aplicacion PWA",
    isSystem: true,
    permissions: [],
    userCount: 0,
  },
];

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<RoleCatalogItem[]>([]);

  const refreshRoles = useCallback(async () => {
    try {
      const data = await getRoleCatalog();
      setRoles(data);
    } catch (error) {
      console.warn("Roles unavailable, using demo fallback.", error);
      setRoles(fallbackRoles);
    }
  }, []);

  useEffect(() => {
    void refreshRoles();
  }, [refreshRoles]);

  const value = useMemo(() => ({ roles, refreshRoles }), [roles, refreshRoles]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within a RoleProvider.");
  }
  return ctx;
}
