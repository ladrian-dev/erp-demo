export type PermissionKey = string;

export interface PermissionItem {
  key: PermissionKey;
  label: string;
  group: "modules" | "views" | "actions";
  description?: string;
}

export interface PermissionGroup {
  id: "modules" | "views" | "actions";
  label: string;
  description: string;
  permissions: PermissionItem[];
}

const modulePermissions: PermissionItem[] = [
  { key: "module.dashboard", label: "Centro de Control", group: "modules" },
  { key: "module.expenses", label: "Centro de Gastos", group: "modules" },
  { key: "module.finance-ops", label: "Freematica", group: "modules" },
  { key: "module.clients", label: "Clientes", group: "modules" },
  { key: "module.notifications", label: "Alertas", group: "modules" },
  { key: "module.resources", label: "Inventario", group: "modules" },
  { key: "module.admin.users", label: "Colaboradores", group: "modules" },
];

const viewPermissions: PermissionItem[] = [
  { key: "view.pwa.home", label: "Inicio (PWA)", group: "views" },
  { key: "view.pwa.expenses", label: "Gastos (PWA)", group: "views" },
  { key: "view.pwa.incidents", label: "Alertas (PWA)", group: "views" },
  { key: "view.pwa.profile", label: "Perfil (PWA)", group: "views" },
];

const actionPermissions: PermissionItem[] = [
  { key: "action.expenses.create", label: "Crear gastos", group: "actions" },
  { key: "action.expenses.approve", label: "Aprobar gastos", group: "actions" },
  { key: "action.expenses.reject", label: "Rechazar gastos", group: "actions" },
  { key: "action.incidents.create", label: "Reportar incidentes", group: "actions" },
  { key: "action.incidents.update", label: "Gestionar alertas", group: "actions" },
  { key: "action.panic.send", label: "Boton de panico", group: "actions" },
];

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "modules",
    label: "Modulos",
    description: "Acceso a secciones principales del panel.",
    permissions: modulePermissions,
  },
  {
    id: "views",
    label: "Vistas",
    description: "Pantallas visibles dentro del modo PWA.",
    permissions: viewPermissions,
  },
  {
    id: "actions",
    label: "Acciones",
    description: "Operaciones que se pueden ejecutar en la plataforma.",
    permissions: actionPermissions,
  },
];

export const PERMISSION_KEYS: PermissionKey[] = PERMISSION_GROUPS.flatMap(
  (group) => group.permissions.map((permission) => permission.key)
);

const approverDefaults: PermissionKey[] = [
  "module.dashboard",
  "module.expenses",
  "module.clients",
  "module.notifications",
  "module.resources",
  "action.expenses.approve",
  "action.expenses.reject",
  "action.incidents.update",
];

const employeeDefaults: PermissionKey[] = [
  "view.pwa.home",
  "view.pwa.expenses",
  "view.pwa.incidents",
  "view.pwa.profile",
  "action.expenses.create",
  "action.incidents.create",
  "action.panic.send",
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  admin: PERMISSION_KEYS,
  approver: approverDefaults,
  employee: employeeDefaults,
};

export function normalizePermissions(input?: PermissionKey[]): PermissionKey[] {
  if (!input) return [];
  const cleaned = new Set<PermissionKey>();
  for (const key of input) {
    if (PERMISSION_KEYS.includes(key)) {
      cleaned.add(key);
    }
  }
  return Array.from(cleaned);
}

export function hasPermission(permissions: PermissionKey[], key: PermissionKey) {
  return permissions.includes(key);
}

export function hasAnyPermission(
  permissions: PermissionKey[],
  keys: PermissionKey[]
) {
  return keys.some((key) => permissions.includes(key));
}
