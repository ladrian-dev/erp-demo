"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { IncidentItem, UserIncidentItem } from "@/lib/types";

export async function getIncidents(filters?: {
  severity?: string;
  status?: string;
  zone?: string;
}): Promise<IncidentItem[]> {
  const incidents = await db.incident.findMany({
    where: {
      ...(filters?.severity ? { severity: filters.severity } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.zone ? { client: { zone: filters.zone } } : {}),
    },
    include: {
      client: { select: { name: true, siteName: true, zone: true } },
      reportedBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return incidents.map((i) => ({
    id: i.id,
    title: i.title,
    type: i.type,
    severity: i.severity,
    description: i.description,
    status: i.status,
    createdAt: i.createdAt.toISOString(),
    resolvedAt: i.resolvedAt?.toISOString() ?? null,
    clientName: i.client.name,
    clientSiteName: i.client.siteName,
    clientZone: i.client.zone,
    reportedByName: i.reportedBy.name,
    assignedToName: i.assignedTo?.name ?? null,
  }));
}

export async function getUserIncidents(
  userId: string
): Promise<UserIncidentItem[]> {
  const incidents = await db.incident.findMany({
    where: { reportedById: userId },
    orderBy: { createdAt: "desc" },
  });

  return incidents.map((incident) => ({
    id: incident.id,
    title: incident.title,
    type: incident.type,
    severity: incident.severity,
    status: incident.status,
    createdAt: incident.createdAt.toISOString(),
  }));
}

export async function getIncidentStats(zone?: string) {
  const where = zone ? { client: { zone } } : {};

  const [critical, high, openCount, resolvedToday] = await Promise.all([
    db.incident.count({ where: { ...where, severity: "critical", status: { not: "resolved" } } }),
    db.incident.count({ where: { ...where, severity: "high", status: { not: "resolved" } } }),
    db.incident.count({ where: { ...where, status: { in: ["open", "assigned", "in_progress"] } } }),
    db.incident.count({
      where: {
        ...where,
        status: "resolved",
        resolvedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return { critical, high, open: openCount, resolvedToday };
}

export async function updateIncidentStatus(id: string, status: string) {
  await db.incident.update({
    where: { id },
    data: {
      status,
      ...(status === "resolved" ? { resolvedAt: new Date() } : {}),
    },
  });

  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export async function assignIncident(id: string, userId: string) {
  await db.incident.update({
    where: { id },
    data: {
      assignedToId: userId,
      status: "assigned",
    },
  });

  revalidatePath("/notifications");
}

export async function createIncident(data: {
  title: string;
  type: string;
  severity: string;
  description: string;
  clientId: string;
  reportedById: string;
}) {
  await db.incident.create({ data });
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}
