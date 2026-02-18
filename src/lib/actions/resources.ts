"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { AssetItem, VehicleItem, VehicleDetail, AssetFormData } from "@/lib/types";
import { assetSchema } from "@/lib/types";

export async function getAssets(): Promise<AssetItem[]> {
  const assets = await db.asset.findMany({
    include: { assignedTo: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return assets.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    serialNumber: a.serialNumber,
    status: a.status,
    location: a.location,
    value: a.value,
    purchaseDate: a.purchaseDate.toISOString(),
    assignedTo: a.assignedTo?.name ?? null,
    assignedToId: a.assignedToId,
  }));
}

export async function createAsset(data: AssetFormData) {
  const validated = assetSchema.parse(data);
  await db.asset.create({
    data: {
      name: validated.name,
      category: validated.category,
      serialNumber: validated.serialNumber || null,
      status: validated.status,
      location: validated.location,
      value: validated.value,
      purchaseDate: new Date(validated.purchaseDate),
      assignedToId: validated.assignedToId || null,
    },
  });
  revalidatePath("/resources");
}

export async function updateAsset(id: string, data: AssetFormData) {
  const validated = assetSchema.parse(data);
  await db.asset.update({
    where: { id },
    data: {
      name: validated.name,
      category: validated.category,
      serialNumber: validated.serialNumber || null,
      status: validated.status,
      location: validated.location,
      value: validated.value,
      purchaseDate: new Date(validated.purchaseDate),
      assignedToId: validated.assignedToId || null,
    },
  });
  revalidatePath("/resources");
}

export async function deleteAsset(id: string) {
  await db.asset.delete({ where: { id } });
  revalidatePath("/resources");
}

export async function getVehicles(): Promise<VehicleItem[]> {
  const vehicles = await db.vehicle.findMany({
    include: {
      assignedTo: { select: { name: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return vehicles.map((v) => ({
    id: v.id,
    make: v.make,
    model: v.model,
    year: v.year,
    licensePlate: v.licensePlate,
    status: v.status,
    ownership: v.ownership,
    mileage: v.mileage,
    fuelType: v.fuelType,
    vinNumber: v.vinNumber,
    lastService: v.lastService?.toISOString() ?? null,
    lat: v.lat,
    lng: v.lng,
    assignedTo: v.assignedTo?.name ?? null,
    assignedToId: v.assignedToId,
    clientName: v.client?.name ?? null,
  }));
}

export async function getVehicleDetail(id: string): Promise<VehicleDetail | null> {
  const v = await db.vehicle.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true } },
      client: { select: { name: true } },
      logs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!v) return null;

  return {
    id: v.id,
    make: v.make,
    model: v.model,
    year: v.year,
    licensePlate: v.licensePlate,
    status: v.status,
    ownership: v.ownership,
    mileage: v.mileage,
    fuelType: v.fuelType,
    vinNumber: v.vinNumber,
    lastService: v.lastService?.toISOString() ?? null,
    lat: v.lat,
    lng: v.lng,
    assignedTo: v.assignedTo?.name ?? null,
    assignedToId: v.assignedToId,
    clientName: v.client?.name ?? null,
    logs: v.logs.map((l) => ({
      id: l.id,
      eventType: l.eventType,
      description: l.description,
      mileageAtEvent: l.mileageAtEvent,
      cost: l.cost,
      createdAt: l.createdAt.toISOString(),
    })),
  };
}

export async function getUsersForAssignment() {
  const users = await db.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return users;
}
