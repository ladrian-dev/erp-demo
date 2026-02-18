import { z } from "zod";

// ─── Approval / Expense Types ───────────────────────────────────

export interface ExpenseWithUser {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string;
  project: string;
  status: string;
  level: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  approverName: string | null;
  clientName: string | null;
}

// ─── ERP Sync Types ─────────────────────────────────────────────

export interface SyncableExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  project: string;
  userName: string;
  approverName: string | null;
  createdAt: string;
}

export interface SyncLogEntry {
  id: string;
  reference: string | null;
  status: string;
  syncedAt: string;
  expenseTitle: string;
  expenseAmount: number;
}

// ─── Resource Types ─────────────────────────────────────────────

export interface AssetItem {
  id: string;
  name: string;
  category: string;
  serialNumber: string | null;
  status: string;
  location: string;
  value: number;
  purchaseDate: string;
  assignedTo: string | null;
  assignedToId: string | null;
}

export interface VehicleItem {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: string;
  ownership: string;
  mileage: number;
  fuelType: string;
  vinNumber: string | null;
  lastService: string | null;
  lat: number | null;
  lng: number | null;
  assignedTo: string | null;
  assignedToId: string | null;
  clientName: string | null;
}

export interface VehicleDetail extends VehicleItem {
  logs: VehicleLogItem[];
}

export interface VehicleLogItem {
  id: string;
  eventType: string;
  description: string;
  mileageAtEvent: number | null;
  cost: number | null;
  createdAt: string;
}

// ─── Client Types ───────────────────────────────────────────────

export interface ClientItem {
  id: string;
  name: string;
  zone: string;
  siteName: string;
  siteType: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  contractStatus: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  guardCount: number;
  vehicleCount: number;
  incidentCount: number;
}

export interface ClientDetail extends ClientItem {
  personnel: { id: string; name: string; department: string; role: string }[];
  recentExpenses: { id: string; title: string; amount: number; status: string; createdAt: string }[];
  recentIncidents: { id: string; title: string; severity: string; status: string; createdAt: string }[];
}

// ─── Incident Types ─────────────────────────────────────────────

export interface IncidentItem {
  id: string;
  title: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  clientName: string;
  clientSiteName: string;
  clientZone: string;
  reportedByName: string;
  assignedToName: string | null;
}

// ─── User Types ─────────────────────────────────────────────────

export const userSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  role: z.string().min(1, "Rol es requerido"),
  department: z.string().min(1, "Departamento es requerido"),
});

export type UserFormData = z.infer<typeof userSchema>;

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  createdAt: string;
  clientName: string | null;
  _count: {
    expenses: number;
    approvedExpenses: number;
  };
}

export interface RoleCatalogItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
}

export interface UserExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: string;
  createdAt: string;
  clientName: string | null;
}

export interface UserIncidentItem {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
}

// ─── Asset Form Types ───────────────────────────────────────────

export const assetSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  category: z.string().min(1, "Categoría es requerida"),
  serialNumber: z.string().optional(),
  status: z.enum(["active", "maintenance", "retired"]),
  location: z.string().min(1, "Ubicación es requerida"),
  value: z.number().min(0, "El valor debe ser positivo"),
  purchaseDate: z.string().min(1, "Fecha de compra es requerida"),
  assignedToId: z.string().optional(),
});

export type AssetFormData = z.infer<typeof assetSchema>;

// ─── Zone Constants ─────────────────────────────────────────────

export const ZONES = ["Norte", "Bajio", "Centro", "Sur", "Peninsular"] as const;
export type Zone = (typeof ZONES)[number];
