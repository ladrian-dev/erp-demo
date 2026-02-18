"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ZONES, type Zone, type RoleCatalogItem } from "@/lib/types";
import { getRoleCatalog } from "@/lib/actions/roles";
import { getUsers } from "@/lib/actions/users";
import {
  DEFAULT_ROLE_PERMISSIONS,
  hasPermission as hasPermissionHelper,
  type PermissionKey,
} from "@/lib/permissions";

export type AppRole = string;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  department: string;
  initials: string;
}

const FALLBACK_USERS: Record<string, AppUser> = {
  admin: {
    id: "admin-001",
    name: "Beatriz Hernandez",
    email: "beatriz.hernandez@securops.mx",
    role: "admin",
    department: "Administracion",
    initials: "BH",
  },
  approver: {
    id: "approver-001",
    name: "Daniel Franco",
    email: "daniel.franco@securops.mx",
    role: "approver",
    department: "Finanzas",
    initials: "DF",
  },
  employee: {
    id: "emp-001",
    name: "Roberto Silva",
    email: "roberto.silva@securops.mx",
    role: "employee",
    department: "Seguridad en Campo",
    initials: "RS",
  },
};

interface RoleContextValue {
  role: AppRole;
  user: AppUser;
  roles: RoleCatalogItem[];
  roleUsers: Record<string, AppUser>;
  permissions: PermissionKey[];
  setRole: (role: AppRole) => void;
  refreshRoles: () => Promise<void>;
  hasPermission: (key: PermissionKey) => boolean;
  isAdmin: boolean;
  isApprover: boolean;
  isEmployee: boolean;
  zone: Zone | null;
  setZone: (zone: Zone | null) => void;
  zones: readonly typeof ZONES[number][];
}

const RoleContext = createContext<RoleContextValue | null>(null);

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole>("admin");
  const [zone, setZone] = useState<Zone | null>(null);
  const [roles, setRoles] = useState<RoleCatalogItem[]>([]);
  const [roleUsers, setRoleUsers] = useState<Record<string, AppUser>>({});

  const refreshRoles = useCallback(async () => {
    const [roleCatalog, users] = await Promise.all([getRoleCatalog(), getUsers()]);
    const roleUserMap: Record<string, AppUser> = {};

    for (const user of users) {
      if (!roleUserMap[user.role]) {
        roleUserMap[user.role] = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          initials: getInitials(user.name),
        };
      }
    }

    setRoles(roleCatalog);
    setRoleUsers(roleUserMap);
  }, []);

  useEffect(() => {
    refreshRoles();
  }, [refreshRoles]);

  const currentRole = roles.find((entry) => entry.key === role);
  const permissions =
    currentRole?.permissions ?? DEFAULT_ROLE_PERMISSIONS[role] ?? [];

  const user =
    roleUsers[role] ??
    FALLBACK_USERS[role] ?? {
      id: "",
      name: currentRole?.name ?? "Usuario",
      email: "",
      role,
      department: "",
      initials: getInitials(currentRole?.name ?? "Usuario"),
    };

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        roles,
        roleUsers,
        permissions,
        setRole,
        refreshRoles,
        hasPermission: (key) => hasPermissionHelper(permissions, key),
        isAdmin: role === "admin",
        isApprover: role === "approver",
        isEmployee: role === "employee",
        zone,
        setZone,
        zones: ZONES,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
