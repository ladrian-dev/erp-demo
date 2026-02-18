import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "./permissions";

// ---------------------------------------------------------------------------
// Singleton & environment
// ---------------------------------------------------------------------------

const isVercel = !!process.env.VERCEL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitialized: boolean;
};

function createPrismaClient() {
  const url = isVercel ? "file::memory:" : "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter } as never);
}

const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

// ---------------------------------------------------------------------------
// Schema creation (CREATE TABLE IF NOT EXISTS)
// ---------------------------------------------------------------------------

async function createSchema() {
  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Client" (
      "id"             TEXT    NOT NULL PRIMARY KEY,
      "name"           TEXT    NOT NULL,
      "zone"           TEXT    NOT NULL,
      "siteName"       TEXT    NOT NULL,
      "siteType"       TEXT    NOT NULL,
      "contactName"    TEXT    NOT NULL,
      "contactEmail"   TEXT    NOT NULL,
      "contactPhone"   TEXT,
      "contractStatus" TEXT    NOT NULL DEFAULT 'active',
      "address"        TEXT,
      "lat"            REAL,
      "lng"            REAL,
      "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id"         TEXT NOT NULL PRIMARY KEY,
      "name"       TEXT NOT NULL,
      "email"      TEXT NOT NULL,
      "role"       TEXT NOT NULL DEFAULT 'employee',
      "department" TEXT NOT NULL,
      "avatarUrl"  TEXT,
      "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "clientId"   TEXT,
      CONSTRAINT "User_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Role" (
      "id"          TEXT    NOT NULL PRIMARY KEY,
      "key"         TEXT    NOT NULL,
      "name"        TEXT    NOT NULL,
      "description" TEXT,
      "isSystem"    BOOLEAN NOT NULL DEFAULT 0,
      "permissions" TEXT    NOT NULL DEFAULT '[]',
      "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Role_key_key" ON "Role"("key")
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Expense" (
      "id"          TEXT    NOT NULL PRIMARY KEY,
      "title"       TEXT    NOT NULL,
      "description" TEXT,
      "amount"      REAL    NOT NULL,
      "category"    TEXT    NOT NULL,
      "project"     TEXT    NOT NULL,
      "status"      TEXT    NOT NULL DEFAULT 'pending',
      "level"       TEXT    NOT NULL DEFAULT 'level_1',
      "receiptUrl"  TEXT,
      "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "userId"      TEXT    NOT NULL,
      "approverId"  TEXT,
      "clientId"    TEXT,
      CONSTRAINT "Expense_userId_fkey"     FOREIGN KEY ("userId")     REFERENCES "User" ("id") ON DELETE RESTRICT,
      CONSTRAINT "Expense_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User" ("id") ON DELETE SET NULL,
      CONSTRAINT "Expense_clientId_fkey"   FOREIGN KEY ("clientId")   REFERENCES "Client" ("id") ON DELETE SET NULL
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ErpSync" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "status"    TEXT NOT NULL DEFAULT 'pending',
      "reference" TEXT,
      "syncedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expenseId" TEXT NOT NULL,
      CONSTRAINT "ErpSync_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE RESTRICT
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "ErpSync_expenseId_key" ON "ErpSync"("expenseId")
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Asset" (
      "id"           TEXT    NOT NULL PRIMARY KEY,
      "name"         TEXT    NOT NULL,
      "category"     TEXT    NOT NULL,
      "serialNumber" TEXT,
      "status"       TEXT    NOT NULL DEFAULT 'active',
      "location"     TEXT    NOT NULL,
      "value"        REAL    NOT NULL,
      "purchaseDate" DATETIME NOT NULL,
      "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "assignedToId" TEXT,
      CONSTRAINT "Asset_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Vehicle" (
      "id"           TEXT    NOT NULL PRIMARY KEY,
      "make"         TEXT    NOT NULL,
      "model"        TEXT    NOT NULL,
      "year"         INTEGER NOT NULL,
      "licensePlate" TEXT    NOT NULL,
      "status"       TEXT    NOT NULL DEFAULT 'active',
      "ownership"    TEXT    NOT NULL DEFAULT 'propio',
      "mileage"      INTEGER NOT NULL,
      "fuelType"     TEXT    NOT NULL DEFAULT 'Gasolina',
      "vinNumber"    TEXT,
      "lastService"  DATETIME,
      "lat"          REAL,
      "lng"          REAL,
      "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "assignedToId" TEXT,
      "clientId"     TEXT,
      CONSTRAINT "Vehicle_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL,
      CONSTRAINT "Vehicle_clientId_fkey"     FOREIGN KEY ("clientId")     REFERENCES "Client" ("id") ON DELETE SET NULL
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate")
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "VehicleLog" (
      "id"             TEXT NOT NULL PRIMARY KEY,
      "eventType"      TEXT NOT NULL,
      "description"    TEXT NOT NULL,
      "mileageAtEvent" INTEGER,
      "cost"           REAL,
      "lat"            REAL,
      "lng"            REAL,
      "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "vehicleId"      TEXT NOT NULL,
      CONSTRAINT "VehicleLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT
    )
  `);

  await prismaClient.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Incident" (
      "id"           TEXT NOT NULL PRIMARY KEY,
      "title"        TEXT NOT NULL,
      "type"         TEXT NOT NULL,
      "severity"     TEXT NOT NULL,
      "description"  TEXT NOT NULL,
      "status"       TEXT NOT NULL DEFAULT 'open',
      "resolvedAt"   DATETIME,
      "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "clientId"     TEXT NOT NULL,
      "reportedById" TEXT NOT NULL,
      "assignedToId" TEXT,
      CONSTRAINT "Incident_clientId_fkey"     FOREIGN KEY ("clientId")     REFERENCES "Client" ("id") ON DELETE RESTRICT,
      CONSTRAINT "Incident_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT,
      CONSTRAINT "Incident_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL
    )
  `);
}

// ---------------------------------------------------------------------------
// Seed demo data
// ---------------------------------------------------------------------------

async function seedDemoData() {
  const existingClients = await prismaClient.client.count();
  if (existingClients > 0) return;

  // ── Roles ──────────────────────────────────────────────────────────
  await prismaClient.role.createMany({
    data: [
      { key: "admin", name: "Administrador", description: "Acceso total al panel", isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.admin ?? [] },
      { key: "approver", name: "Aprobador", description: "Aprobacion de gastos y alertas", isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.approver ?? [] },
      { key: "employee", name: "Empleado", description: "Acceso a la aplicacion PWA", isSystem: true, permissions: DEFAULT_ROLE_PERMISSIONS.employee ?? [] },
    ],
  });

  // ── Clients ────────────────────────────────────────────────────────
  const clientReynosa = await prismaClient.client.create({
    data: { id: "client-001", name: "Energía Renovable del Norte S.A.", zone: "Norte", siteName: "Parque Eólico Reynosa", siteType: "Eolica", contactName: "Ing. Fernando Salinas", contactEmail: "f.salinas@ernorte.com", contactPhone: "+52 899 123 4567", contractStatus: "active", address: "Carretera Reynosa-Monterrey Km 45, Tamaulipas", lat: 26.0508, lng: -98.2279 },
  });
  const clientSonora = await prismaClient.client.create({
    data: { id: "client-002", name: "Solar del Pacífico S.A. de C.V.", zone: "Norte", siteName: "Central Solar Sonora Norte", siteType: "Solar", contactName: "Lic. Patricia Vega", contactEmail: "p.vega@solarpacifico.mx", contactPhone: "+52 662 987 6543", contractStatus: "active", address: "Carretera Puerto Peñasco Km 12, Sonora", lat: 31.3182, lng: -110.9417 },
  });
  const clientOaxaca = await prismaClient.client.create({
    data: { id: "client-003", name: "Vientos del Istmo S.A.", zone: "Sur", siteName: "Parque Eólico Oaxaca Sur", siteType: "Eolica", contactName: "Ing. Marco Ruiz", contactEmail: "m.ruiz@vientosistmo.com", contactPhone: "+52 971 234 5678", contractStatus: "active", address: "Juchitán de Zaragoza, Oaxaca", lat: 16.4358, lng: -95.0196 },
  });
  const clientYucatan = await prismaClient.client.create({
    data: { id: "client-004", name: "Fotovoltaica Peninsular S.A.", zone: "Peninsular", siteName: "Central Solar Yucatán", siteType: "Solar", contactName: "Ing. Claudia Méndez", contactEmail: "c.mendez@fotopeninsular.mx", contactPhone: "+52 999 345 6789", contractStatus: "active", address: "Tizimín, Yucatán", lat: 21.1428, lng: -88.1647 },
  });
  const clientBC = await prismaClient.client.create({
    data: { id: "client-005", name: "Eólica Baja S.A. de C.V.", zone: "Norte", siteName: "Parque Eólico La Rumorosa", siteType: "Eolica", contactName: "Ing. Raúl Domínguez", contactEmail: "r.dominguez@eolicabaja.com", contactPhone: "+52 686 456 7890", contractStatus: "pending", address: "La Rumorosa, Baja California", lat: 32.5422, lng: -116.0614 },
  });
  const clientBajio = await prismaClient.client.create({
    data: { id: "client-006", name: "Renovables del Bajío S.A.", zone: "Bajio", siteName: "Central Solar Aguascalientes", siteType: "Solar", contactName: "Lic. Andrea López", contactEmail: "a.lopez@renovablesbajio.mx", contactPhone: "+52 449 567 8901", contractStatus: "active", address: "El Llano, Aguascalientes", lat: 21.9213, lng: -102.2908 },
  });
  const clientCentro = await prismaClient.client.create({
    data: { id: "client-007", name: "Energía Verde Puebla S.A.", zone: "Centro", siteName: "Parque Eólico Sierra Norte", siteType: "Eolica", contactName: "Ing. Tomás Ríos", contactEmail: "t.rios@evpuebla.com", contactPhone: "+52 222 678 9012", contractStatus: "expired", address: "Tetela de Ocampo, Puebla", lat: 19.8167, lng: -97.8 },
  });

  // ── Users ──────────────────────────────────────────────────────────
  const admin = await prismaClient.user.create({ data: { id: "admin-001", name: "Beatriz Hernández", email: "beatriz.hernandez@securops.mx", role: "admin", department: "Administración" } });
  const approver = await prismaClient.user.create({ data: { id: "approver-001", name: "Daniel Franco", email: "daniel.franco@securops.mx", role: "approver", department: "Finanzas" } });
  const guard1 = await prismaClient.user.create({ data: { id: "emp-001", name: "Roberto Silva", email: "roberto.silva@securops.mx", role: "employee", department: "Seguridad en Campo", clientId: clientReynosa.id } });
  const guard2 = await prismaClient.user.create({ data: { id: "emp-002", name: "Miguel Ángel Ortiz", email: "miguel.ortiz@securops.mx", role: "employee", department: "Seguridad en Campo", clientId: clientSonora.id } });
  const guard3 = await prismaClient.user.create({ data: { id: "emp-003", name: "Javier Castillo", email: "javier.castillo@securops.mx", role: "employee", department: "Seguridad en Campo", clientId: clientOaxaca.id } });
  const supervisor1 = await prismaClient.user.create({ data: { id: "emp-004", name: "Laura Medina", email: "laura.medina@securops.mx", role: "employee", department: "Supervisión", clientId: clientReynosa.id } });
  const driver1 = await prismaClient.user.create({ data: { id: "emp-005", name: "Ernesto Vázquez", email: "ernesto.vazquez@securops.mx", role: "employee", department: "Logística", clientId: clientYucatan.id } });
  const guard4 = await prismaClient.user.create({ data: { id: "emp-006", name: "Carlos Fuentes", email: "carlos.fuentes@securops.mx", role: "employee", department: "Seguridad en Campo", clientId: clientBajio.id } });
  const guard5 = await prismaClient.user.create({ data: { id: "emp-007", name: "Patricia Ramos", email: "patricia.ramos@securops.mx", role: "employee", department: "Seguridad en Campo", clientId: clientYucatan.id } });
  const technic1 = await prismaClient.user.create({ data: { id: "emp-008", name: "Sebastián Morales", email: "sebastian.morales@securops.mx", role: "employee", department: "Soporte Técnico" } });

  // ── Expenses ───────────────────────────────────────────────────────
  const expenses = await Promise.all([
    prismaClient.expense.create({ data: { title: "Uniformes tácticos Q1", description: "20 uniformes tácticos para guardias nuevos – Parque Eólico Reynosa", amount: 4200, category: "Uniformes", project: "Parque Eólico Reynosa", status: "pending", level: "level_1", userId: guard1.id, clientId: clientReynosa.id } }),
    prismaClient.expense.create({ data: { title: "Radios Motorola DTR720 (x5)", description: "Radios digitales para comunicación en campo – Central Solar Sonora", amount: 3850, category: "Comunicaciones", project: "Central Solar Sonora", status: "pending", level: "level_1", userId: guard2.id, clientId: clientSonora.id } }),
    prismaClient.expense.create({ data: { title: "Combustible flotilla Febrero", description: "Vales de combustible para 4 vehículos zona Norte", amount: 2800, category: "Combustible", project: "Parque Eólico Reynosa", status: "pending", level: "level_1", userId: driver1.id, clientId: clientReynosa.id } }),
    prismaClient.expense.create({ data: { title: "Linternas tácticas Streamlight", description: "10x Streamlight Stinger 2020 para rondines nocturnos", amount: 1950, category: "Equipamiento", project: "Parque Eólico Oaxaca", status: "pending", level: "level_1", userId: guard3.id, clientId: clientOaxaca.id } }),
    prismaClient.expense.create({ data: { title: "Casetas y peajes Enero", description: "Gastos de casetas para traslados entre plantas zona Norte", amount: 890, category: "Transporte", project: "General", status: "pending", level: "level_1", userId: supervisor1.id } }),
    prismaClient.expense.create({ data: { title: "Hospedaje guardias Oaxaca", description: "Hospedaje para 4 guardias durante rotación de turno", amount: 3200, category: "Hospedaje", project: "Parque Eólico Oaxaca", status: "pending", level: "level_1", userId: guard3.id, clientId: clientOaxaca.id } }),
    prismaClient.expense.create({ data: { title: "Sistema CCTV Hikvision completo", description: "32 cámaras IP + NVR para perímetro de Central Solar Sonora", amount: 28500, category: "Vigilancia", project: "Central Solar Sonora", status: "pending", level: "executive", userId: technic1.id, clientId: clientSonora.id } }),
    prismaClient.expense.create({ data: { title: "Renovación leasing 2 camionetas", description: "Anticipo leasing Toyota Hilux 2025 para zona Sur", amount: 15000, category: "Vehículos", project: "General", status: "pending", level: "executive", userId: driver1.id } }),
    prismaClient.expense.create({ data: { title: "Dron DJI Matrice 30T", description: "Dron térmico para vigilancia perimetral nocturna – Reynosa", amount: 12800, category: "Vigilancia", project: "Parque Eólico Reynosa", status: "pending", level: "executive", userId: supervisor1.id, clientId: clientReynosa.id } }),
    prismaClient.expense.create({ data: { title: "Seguro vehicular flota completa", description: "Póliza anual para 13 vehículos – cobertura amplia", amount: 9200, category: "Seguros", project: "General", status: "pending", level: "executive", userId: approver.id } }),
    prismaClient.expense.create({ data: { title: "Chalecos antibalas nivel IIIA (x15)", description: "Chalecos tácticos para personal de campo – todas las zonas", amount: 4500, category: "Equipamiento", project: "General", status: "approved", level: "level_1", userId: guard1.id, approverId: approver.id } }),
    prismaClient.expense.create({ data: { title: "Mantenimiento preventivo flotilla", description: "Servicio de 10,000 km para 4 vehículos zona Norte", amount: 3800, category: "Vehículos", project: "Parque Eólico Reynosa", status: "approved", level: "level_1", userId: driver1.id, approverId: approver.id, clientId: clientReynosa.id } }),
    prismaClient.expense.create({ data: { title: "Equipo de visión nocturna (x4)", description: "Monoculares térmicos Pulsar Helion 2 XP50 para rondines", amount: 4800, category: "Vigilancia", project: "Parque Eólico Oaxaca", status: "approved", level: "level_1", userId: guard3.id, approverId: approver.id, clientId: clientOaxaca.id } }),
    prismaClient.expense.create({ data: { title: "Capacitación protocolos de seguridad", description: "Programa de certificación para 25 guardias – Nivel C4", amount: 18500, category: "Capacitación", project: "General", status: "approved", level: "executive", userId: supervisor1.id, approverId: admin.id } }),
    prismaClient.expense.create({ data: { title: "GPS trackers flota arrendada", description: "Instalación de 9 dispositivos GPS para vehículos en leasing", amount: 7200, category: "Vigilancia", project: "General", status: "approved", level: "executive", userId: technic1.id, approverId: admin.id } }),
    prismaClient.expense.create({ data: { title: "Viaje primera clase Cancún", description: "Boleto primera clase para supervisión – no justificado", amount: 4800, category: "Transporte", project: "Central Solar Yucatán", status: "rejected", level: "level_1", userId: guard5.id, approverId: approver.id, clientId: clientYucatan.id } }),
    prismaClient.expense.create({ data: { title: "Equipo de aire acondicionado oficina", description: "Sistema split inverter – no prioritario", amount: 8500, category: "Equipamiento", project: "General", status: "rejected", level: "executive", userId: technic1.id, approverId: admin.id } }),
    prismaClient.expense.create({ data: { title: "Radios Kenwood NX-3300 (x10)", description: "Radios portátiles para comunicación entre puntos de control", amount: 4100, category: "Comunicaciones", project: "Parque Eólico Reynosa", status: "synced", level: "level_1", userId: guard1.id, approverId: approver.id, clientId: clientReynosa.id } }),
    prismaClient.expense.create({ data: { title: "Renta bodega equipo Monterrey", description: "Almacén para equipo táctico y suministros – 6 meses", amount: 5400, category: "Instalaciones", project: "General", status: "synced", level: "executive", userId: admin.id, approverId: admin.id } }),
    prismaClient.expense.create({ data: { title: "Póliza RC profesional", description: "Seguro de responsabilidad civil para operaciones en campo", amount: 6800, category: "Seguros", project: "General", status: "synced", level: "executive", userId: approver.id, approverId: admin.id } }),
    prismaClient.expense.create({ data: { title: "Botas tácticas Magnum (x30)", description: "Calzado de seguridad para todo el personal de campo", amount: 3500, category: "Uniformes", project: "General", status: "synced", level: "level_1", userId: supervisor1.id, approverId: approver.id } }),
  ]);

  // ── ERP Sync logs ──────────────────────────────────────────────────
  const syncedExpenses = expenses.filter((e) => e.status === "synced");
  for (const expense of syncedExpenses) {
    await prismaClient.erpSync.create({
      data: {
        expenseId: expense.id,
        status: "synced",
        reference: `FRM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        syncedAt: new Date(),
      },
    });
  }

  // ── Assets ─────────────────────────────────────────────────────────
  await prismaClient.asset.createMany({
    data: [
      { name: "Radio Motorola DTR720", category: "Radio", serialNumber: "MOT-DTR-001", status: "active", location: "Parque Eólico Reynosa", value: 850, purchaseDate: new Date("2024-06-15"), assignedToId: guard1.id },
      { name: "Radio Motorola DTR720", category: "Radio", serialNumber: "MOT-DTR-002", status: "active", location: "Central Solar Sonora", value: 850, purchaseDate: new Date("2024-06-15"), assignedToId: guard2.id },
      { name: "Cámara CCTV Hikvision DS-2CD2347", category: "CCTV", serialNumber: "HKV-CAM-014", status: "active", location: "Parque Eólico Reynosa - Sector A", value: 380, purchaseDate: new Date("2024-03-10") },
      { name: "NVR Hikvision 32 canales", category: "CCTV", serialNumber: "HKV-NVR-003", status: "active", location: "Parque Eólico Reynosa - Caseta Central", value: 1200, purchaseDate: new Date("2024-03-10") },
      { name: "DJI Mavic 3 Enterprise", category: "Dron", serialNumber: "DJI-M3E-001", status: "active", location: "Central Solar Sonora", value: 3500, purchaseDate: new Date("2024-09-01"), assignedToId: supervisor1.id },
      { name: "Chaleco antibalas nivel IIIA", category: "Chaleco", serialNumber: "CHL-IIIA-007", status: "active", location: "Parque Eólico Oaxaca", value: 320, purchaseDate: new Date("2024-01-20"), assignedToId: guard3.id },
      { name: "Linterna táctica Streamlight Stinger", category: "Linterna", serialNumber: "STR-STG-015", status: "active", location: "Central Solar Yucatán", value: 195, purchaseDate: new Date("2024-07-05"), assignedToId: guard5.id },
      { name: "Laptop Panasonic Toughbook CF-33", category: "Laptop", serialNumber: "PAN-TB-004", status: "active", location: "Parque Eólico Reynosa - Caseta Central", value: 2800, purchaseDate: new Date("2024-04-12"), assignedToId: supervisor1.id },
      { name: "GPS Tracker Queclink GV300", category: "GPS", serialNumber: "QCL-GV-009", status: "maintenance", location: "Taller Monterrey", value: 180, purchaseDate: new Date("2023-11-15") },
      { name: "Monocular térmico Pulsar Helion 2", category: "Visión Nocturna", serialNumber: "PLS-HLN-002", status: "active", location: "Parque Eólico Oaxaca", value: 2200, purchaseDate: new Date("2024-08-20"), assignedToId: guard3.id },
      { name: "Radio Kenwood NX-3300", category: "Radio", serialNumber: "KNW-NX-021", status: "retired", location: "Almacén CDMX", value: 650, purchaseDate: new Date("2022-03-10") },
      { name: "Cámara corporal Axon Body 3", category: "Cámara Corporal", serialNumber: "AXN-BD3-006", status: "active", location: "Central Solar Aguascalientes", value: 750, purchaseDate: new Date("2024-10-01"), assignedToId: guard4.id },
    ],
  });

  // ── Vehicles ───────────────────────────────────────────────────────
  await Promise.all([
    prismaClient.vehicle.create({ data: { id: "veh-001", make: "Toyota", model: "Hilux SR", year: 2023, licensePlate: "NLD-1234", status: "active", ownership: "propio", mileage: 24500, fuelType: "Diesel", vinNumber: "JTFBT4CD4NJ123456", lastService: new Date("2025-01-15"), lat: 26.0508, lng: -98.2279, assignedToId: guard1.id, clientId: clientReynosa.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-002", make: "Nissan", model: "NP300 Frontier", year: 2022, licensePlate: "MXL-5678", status: "active", ownership: "propio", mileage: 58200, fuelType: "Gasolina", vinNumber: "3N6AD35A8NK654321", lastService: new Date("2025-02-01"), lat: 31.3182, lng: -110.9417, assignedToId: guard2.id, clientId: clientSonora.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-003", make: "Ford", model: "Ranger XLT", year: 2023, licensePlate: "JAL-9012", status: "active", ownership: "propio", mileage: 31800, fuelType: "Diesel", vinNumber: "1FTER4FH5NLA98765", lastService: new Date("2025-01-28"), lat: 16.4358, lng: -95.0196, assignedToId: guard3.id, clientId: clientOaxaca.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-004", make: "Chevrolet", model: "Silverado 1500", year: 2024, licensePlate: "TMP-3456", status: "active", ownership: "propio", mileage: 12300, fuelType: "Gasolina", vinNumber: "3GCPK9EL5RG567890", lastService: new Date("2025-02-10"), lat: 21.1428, lng: -88.1647, assignedToId: driver1.id, clientId: clientYucatan.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-005", make: "Toyota", model: "Hilux DLX", year: 2024, licensePlate: "NLE-7890", status: "active", ownership: "arrendamiento", mileage: 8900, fuelType: "Diesel", lastService: new Date("2025-01-20"), lat: 25.6866, lng: -100.3161, assignedToId: supervisor1.id, clientId: clientReynosa.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-006", make: "Nissan", model: "NV350 Urvan", year: 2023, licensePlate: "SON-2345", status: "active", ownership: "arrendamiento", mileage: 42100, fuelType: "Diesel", lastService: new Date("2024-12-15"), lat: 31.29, lng: -110.95, assignedToId: guard2.id, clientId: clientSonora.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-007", make: "Ford", model: "Transit Van", year: 2024, licensePlate: "OAX-6789", status: "maintenance", ownership: "arrendamiento", mileage: 15600, fuelType: "Diesel", lastService: new Date("2024-12-20"), lat: 16.43, lng: -95.01, clientId: clientOaxaca.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-008", make: "Chevrolet", model: "S10 Max", year: 2023, licensePlate: "YUC-0123", status: "active", ownership: "arrendamiento", mileage: 28400, fuelType: "Gasolina", lastService: new Date("2025-01-05"), lat: 21.15, lng: -88.17, assignedToId: guard5.id, clientId: clientYucatan.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-009", make: "Toyota", model: "Hilux SR", year: 2024, licensePlate: "BCN-4567", status: "active", ownership: "arrendamiento", mileage: 5200, fuelType: "Diesel", lastService: new Date("2025-02-05"), lat: 32.5422, lng: -116.0614, clientId: clientBC.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-010", make: "Nissan", model: "Kicks Advance", year: 2024, licensePlate: "AGS-8901", status: "active", ownership: "arrendamiento", mileage: 11200, fuelType: "Gasolina", lastService: new Date("2025-01-25"), lat: 21.9213, lng: -102.2908, assignedToId: guard4.id, clientId: clientBajio.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-011", make: "Ford", model: "Bronco Sport", year: 2024, licensePlate: "PUE-2345", status: "out_of_service", ownership: "arrendamiento", mileage: 3100, fuelType: "Gasolina", lastService: new Date("2024-11-30"), lat: 19.8167, lng: -97.8, clientId: clientCentro.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-012", make: "Chevrolet", model: "Tornado Van", year: 2023, licensePlate: "NLE-6780", status: "active", ownership: "arrendamiento", mileage: 37500, fuelType: "Gasolina", lastService: new Date("2025-02-08"), lat: 25.7, lng: -100.32, assignedToId: technic1.id } }),
    prismaClient.vehicle.create({ data: { id: "veh-013", make: "Toyota", model: "Hilux Adventure", year: 2024, licensePlate: "TAM-1122", status: "active", ownership: "arrendamiento", mileage: 6800, fuelType: "Diesel", lastService: new Date("2025-02-12"), lat: 26.06, lng: -98.22, assignedToId: guard1.id, clientId: clientReynosa.id } }),
  ]);

  // ── Vehicle Logs ───────────────────────────────────────────────────
  const vehicleLogs = [
    { vehicleId: "veh-001", eventType: "mantenimiento", description: "Servicio de 20,000 km – cambio de aceite, filtros y frenos", mileageAtEvent: 20000, cost: 4500 },
    { vehicleId: "veh-001", eventType: "combustible", description: "Carga completa – Gasolinera Pemex Reynosa Centro", mileageAtEvent: 22100, cost: 1200 },
    { vehicleId: "veh-001", eventType: "checkpoint", description: "Checkpoint de entrada – Parque Eólico Reynosa Sector B", mileageAtEvent: 23800, lat: 26.051, lng: -98.2285 },
    { vehicleId: "veh-001", eventType: "combustible", description: "Carga completa – Gasolinera BP Carretera Reynosa-Monterrey", mileageAtEvent: 24200, cost: 1350 },
    { vehicleId: "veh-002", eventType: "mantenimiento", description: "Servicio de 55,000 km – cambio de aceite y rotación de llantas", mileageAtEvent: 55000, cost: 3200 },
    { vehicleId: "veh-002", eventType: "cambio_aceite", description: "Cambio de aceite sintético 5W-30", mileageAtEvent: 50000, cost: 1800 },
    { vehicleId: "veh-002", eventType: "combustible", description: "Carga completa – Gasolinera Shell Hermosillo", mileageAtEvent: 57000, cost: 1100 },
    { vehicleId: "veh-003", eventType: "revision", description: "Revisión general pre-viaje Oaxaca – todo en orden", mileageAtEvent: 30000 },
    { vehicleId: "veh-003", eventType: "mantenimiento", description: "Cambio de balatas y discos delanteros", mileageAtEvent: 28000, cost: 2800 },
    { vehicleId: "veh-004", eventType: "combustible", description: "Carga completa – Gasolinera Mobil Tizimín", mileageAtEvent: 11500, cost: 980 },
    { vehicleId: "veh-004", eventType: "checkpoint", description: "Punto de control – Entrada Central Solar Yucatán", mileageAtEvent: 12000, lat: 21.1428, lng: -88.1647 },
    { vehicleId: "veh-005", eventType: "mantenimiento", description: "Servicio de 5,000 km – primer servicio", mileageAtEvent: 5000, cost: 2200 },
    { vehicleId: "veh-007", eventType: "incidente", description: "Falla en sistema eléctrico – trasladado a taller autorizado Ford", mileageAtEvent: 15600, cost: 8500 },
    { vehicleId: "veh-007", eventType: "mantenimiento", description: "Reparación sistema eléctrico – en espera de refacción", mileageAtEvent: 15600, cost: 5200 },
    { vehicleId: "veh-011", eventType: "incidente", description: "Colisión menor en estacionamiento – daño en defensa trasera", mileageAtEvent: 3100, cost: 12000 },
  ];
  for (const log of vehicleLogs) {
    await prismaClient.vehicleLog.create({
      data: { ...log, createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) },
    });
  }

  // ── Incidents ──────────────────────────────────────────────────────
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  const incidentData = [
    { title: "Intrusión perimetral detectada – Sector B", type: "intrusion", severity: "critical", description: "Sensores de movimiento activados en el perímetro norte del Sector B. Cámaras confirman presencia de 2 personas no identificadas cerca de la subestación eléctrica.", status: "open", clientId: clientReynosa.id, reportedById: guard1.id, createdAt: new Date(now - 2 * hour) },
    { title: "Botón de pánico activado – Guardia en rondín", type: "panic_button", severity: "critical", description: "El guardia Roberto Silva activó el botón de pánico durante rondín nocturno en el perímetro sur de la Central Solar. Se perdió comunicación por radio hace 5 minutos.", status: "assigned", clientId: clientSonora.id, reportedById: guard2.id, assignedToId: supervisor1.id, createdAt: new Date(now - 45 * 60 * 1000) },
    { title: "Falla en sistema CCTV – Sector 3 sin cobertura", type: "equipment_failure", severity: "high", description: "4 cámaras del Sector 3 fuera de línea desde las 02:00 hrs. El NVR reporta error de conexión. Zona sin cobertura visual de aproximadamente 800m de perímetro.", status: "in_progress", clientId: clientOaxaca.id, reportedById: guard3.id, assignedToId: technic1.id, createdAt: new Date(now - 6 * hour) },
    { title: "Alerta meteorológica – Vientos >90 km/h", type: "weather_alert", severity: "high", description: "CONAGUA emitió alerta de vientos fuertes para la zona de La Rumorosa. Se recomienda suspender rondines vehiculares y asegurar equipamiento externo.", status: "open", clientId: clientBC.id, reportedById: admin.id, createdAt: new Date(now - 3 * hour) },
    { title: "Vehículo no autorizado en perímetro", type: "access_violation", severity: "high", description: "Camioneta sin placas detectada en camino de acceso sur de la Central Solar. El vehículo estuvo 15 minutos estacionado antes de retirarse. Se capturaron imágenes.", status: "assigned", clientId: clientYucatan.id, reportedById: guard5.id, assignedToId: guard5.id, createdAt: new Date(now - 12 * hour) },
    { title: "Falla en sensor de movimiento – Puerta 4", type: "equipment_failure", severity: "medium", description: "Sensor PIR de la Puerta 4 del acceso principal genera falsas alarmas desde las 18:00. Posible interferencia por fauna local.", status: "open", clientId: clientReynosa.id, reportedById: guard1.id, createdAt: new Date(now - 1 * day) },
    { title: "Acceso fuera de horario – Personal de mantenimiento", type: "access_violation", severity: "medium", description: "2 técnicos de mantenimiento del cliente ingresaron a las 23:45 sin autorización previa. Se verificó identidad y se les permitió el acceso bajo escolta.", status: "resolved", clientId: clientSonora.id, reportedById: guard2.id, resolvedAt: new Date(now - 18 * hour), createdAt: new Date(now - 1.5 * day) },
    { title: "Dron no identificado sobrevolando planta", type: "intrusion", severity: "medium", description: "Se detectó un dron sobrevolando la zona de paneles solares a las 14:30. Se documentó con fotografías. El dron se retiró después de 10 minutos.", status: "resolved", clientId: clientBajio.id, reportedById: guard4.id, resolvedAt: new Date(now - 2 * day), createdAt: new Date(now - 2.5 * day) },
    { title: "Cerco perimetral dañado – Sector Este", type: "equipment_failure", severity: "low", description: "Se detectó sección de 3 metros de cerco de púas dañado, probablemente por ganado de la zona. No hay evidencia de intrusión.", status: "open", clientId: clientOaxaca.id, reportedById: guard3.id, createdAt: new Date(now - 3 * day) },
    { title: "Luminaria LED fundida – Estacionamiento", type: "equipment_failure", severity: "low", description: "Luminaria #7 del estacionamiento principal no enciende. Requiere reemplazo de driver LED.", status: "resolved", clientId: clientYucatan.id, reportedById: driver1.id, resolvedAt: new Date(now - 4 * day), createdAt: new Date(now - 5 * day) },
    { title: "Solicitud de escolta – Transporte de equipo", type: "access_violation", severity: "low", description: "El cliente solicitó escolta para transporte de paneles solares de reemplazo. Programado para mañana a las 08:00.", status: "assigned", clientId: clientBajio.id, reportedById: guard4.id, assignedToId: guard4.id, createdAt: new Date(now - 6 * hour) },
    { title: "Emergencia médica – Guardia con deshidratación", type: "medical", severity: "high", description: "El guardia Carlos Fuentes presentó síntomas de deshidratación severa durante turno. Se activó protocolo médico y fue trasladado a clínica más cercana.", status: "resolved", clientId: clientBajio.id, reportedById: guard4.id, assignedToId: supervisor1.id, resolvedAt: new Date(now - 1 * day), createdAt: new Date(now - 1.2 * day) },
  ];

  for (const incident of incidentData) {
    await prismaClient.incident.create({ data: incident as never });
  }
}

// ---------------------------------------------------------------------------
// Lazy initialization
// ---------------------------------------------------------------------------

let initPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (globalForPrisma.dbInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await createSchema();
      await seedDemoData();
      globalForPrisma.dbInitialized = true;
    })();
  }
  return initPromise;
}

// ---------------------------------------------------------------------------
// Auto-initializing proxy
// ---------------------------------------------------------------------------

const MODEL_NAMES = new Set([
  "client",
  "user",
  "role",
  "expense",
  "erpSync",
  "asset",
  "vehicle",
  "vehicleLog",
  "incident",
]);

export const db = new Proxy(prismaClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    if (
      typeof prop === "string" &&
      MODEL_NAMES.has(prop) &&
      typeof value === "object" &&
      value !== null
    ) {
      return new Proxy(value as object, {
        get(modelTarget, modelProp) {
          const fn = Reflect.get(modelTarget, modelProp);
          if (typeof fn === "function") {
            return async (...args: unknown[]) => {
              await ensureInitialized();
              return (fn as Function).apply(modelTarget, args);
            };
          }
          return fn;
        },
      });
    }

    return value;
  },
}) as typeof prismaClient;
