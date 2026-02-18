"use server";

import { db } from "@/lib/db";

export async function getAdminDashboardData(zone?: string) {
  const clientWhere = zone ? { client: { zone } } : {};
  const expenseClientWhere = zone ? { client: { zone } } : {};

  const [
    activeGuards,
    openIncidents,
    activeClients,
    monthSpend,
    activeVehicles,
    pendingSync,
    spendByZone,
    incidentsBySeverity,
    recentIncidents,
    recentExpenses,
  ] = await Promise.all([
    // Active guards (employees)
    db.user.count({
      where: { role: "employee", ...(zone ? { client: { zone } } : {}) },
    }),
    // Open incidents
    db.incident.count({
      where: { status: { in: ["open", "assigned", "in_progress"] }, ...clientWhere },
    }),
    // Active clients
    db.client.count({
      where: { contractStatus: "active", ...(zone ? { zone } : {}) },
    }),
    // Month spend
    db.expense.aggregate({
      where: {
        status: { in: ["approved", "synced"] },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
        ...expenseClientWhere,
      },
      _sum: { amount: true },
    }),
    // Active vehicles
    db.vehicle.count({
      where: { status: "active", ...(zone ? { client: { zone } } : {}) },
    }),
    // Pending ERP sync
    db.expense.count({
      where: { status: "approved", ...expenseClientWhere },
    }),
    // Spend by zone
    db.expense.findMany({
      where: {
        status: { in: ["approved", "synced"] },
        client: { isNot: null },
        ...expenseClientWhere,
      },
      select: {
        amount: true,
        client: { select: { zone: true } },
      },
    }),
    // Incidents by severity
    db.incident.groupBy({
      by: ["severity"],
      where: { status: { in: ["open", "assigned", "in_progress"] }, ...clientWhere },
      _count: true,
    }),
    // Recent incidents
    db.incident.findMany({
      take: 5,
      where: clientWhere,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, siteName: true } },
      },
    }),
    // Recent expenses
    db.expense.findMany({
      take: 5,
      where: expenseClientWhere,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        client: { select: { name: true } },
      },
    }),
  ]);

  // Aggregate spend by zone
  const zoneSpendMap: Record<string, number> = {};
  for (const e of spendByZone) {
    const z = e.client?.zone ?? "Sin Zona";
    zoneSpendMap[z] = (zoneSpendMap[z] ?? 0) + e.amount;
  }

  return {
    activeGuards,
    openIncidents,
    activeClients,
    monthSpend: monthSpend._sum.amount ?? 0,
    activeVehicles,
    pendingSync,
    spendByZone: Object.entries(zoneSpendMap).map(([zone, amount]) => ({
      zone,
      amount,
    })),
    incidentsBySeverity: incidentsBySeverity.map((i) => ({
      severity: i.severity,
      count: i._count,
    })),
    recentIncidents: recentIncidents.map((i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity,
      status: i.status,
      clientName: i.client.name,
      siteName: i.client.siteName,
      createdAt: i.createdAt.toISOString(),
    })),
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      status: e.status,
      userName: e.user.name,
      clientName: e.client?.name ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export async function getApproverDashboardData(approverId: string, zone?: string) {
  const clientWhere = zone ? { client: { zone } } : {};

  const [pendingApprovals, teamSpendThisMonth, approvedThisMonth, recentPending] =
    await Promise.all([
      db.expense.count({
        where: { status: "pending", level: "level_1", ...clientWhere },
      }),
      db.expense.aggregate({
        where: {
          status: { in: ["approved", "synced"] },
          level: "level_1",
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          ...clientWhere,
        },
        _sum: { amount: true },
      }),
      db.expense.count({
        where: {
          status: { in: ["approved", "synced"] },
          approverId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          ...clientWhere,
        },
      }),
      db.expense.findMany({
        where: { status: "pending", level: "level_1", ...clientWhere },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, department: true } } },
      }),
    ]);

  return {
    pendingApprovals,
    teamSpendThisMonth: teamSpendThisMonth._sum.amount ?? 0,
    approvedThisMonth,
    recentPending: recentPending.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      category: e.category,
      userName: e.user.name,
      department: e.user.department,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}
