"use server";

import { db } from "@/lib/db";
import type { ClientItem, ClientDetail } from "@/lib/types";

export async function getClients(zone?: string): Promise<ClientItem[]> {
  const clients = await db.client.findMany({
    where: zone ? { zone } : undefined,
    include: {
      _count: {
        select: {
          users: true,
          vehicles: true,
          incidents: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    zone: c.zone,
    siteName: c.siteName,
    siteType: c.siteType,
    contactName: c.contactName,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    contractStatus: c.contractStatus,
    address: c.address,
    lat: c.lat,
    lng: c.lng,
    guardCount: c._count.users,
    vehicleCount: c._count.vehicles,
    incidentCount: c._count.incidents,
  }));
}

export async function getClientDetail(id: string): Promise<ClientDetail | null> {
  const c = await db.client.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          vehicles: true,
          incidents: true,
        },
      },
      users: {
        select: { id: true, name: true, department: true, role: true },
        orderBy: { name: "asc" },
      },
      expenses: {
        select: { id: true, title: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      incidents: {
        select: { id: true, title: true, severity: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!c) return null;

  return {
    id: c.id,
    name: c.name,
    zone: c.zone,
    siteName: c.siteName,
    siteType: c.siteType,
    contactName: c.contactName,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    contractStatus: c.contractStatus,
    address: c.address,
    lat: c.lat,
    lng: c.lng,
    guardCount: c._count.users,
    vehicleCount: c._count.vehicles,
    incidentCount: c._count.incidents,
    personnel: c.users,
    recentExpenses: c.expenses.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    recentIncidents: c.incidents.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    })),
  };
}

