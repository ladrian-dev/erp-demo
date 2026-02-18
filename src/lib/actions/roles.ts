"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { RoleCatalogItem } from "@/lib/types";
import {
  DEFAULT_ROLE_PERMISSIONS,
  normalizePermissions,
} from "@/lib/permissions";

function slugifyRoleKey(name: string) {
  const ascii = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const cleaned = ascii
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
  return cleaned || "role";
}

async function getUniqueRoleKey(base: string) {
  let key = base;
  let counter = 2;
  while (await db.role.findUnique({ where: { key } })) {
    key = `${base}-${counter}`;
    counter += 1;
  }
  return key;
}

async function ensureSystemRoles() {
  const systemKeys = Object.keys(DEFAULT_ROLE_PERMISSIONS);
  const existing = await db.role.findMany({ where: { key: { in: systemKeys } } });
  const existingKeys = new Set(existing.map((r) => r.key));

  for (const key of systemKeys) {
    if (!existingKeys.has(key)) {
      const name =
        key === "admin" ? "Administrador" : key === "approver" ? "Aprobador" : "Empleado";
      await db.role.create({
        data: {
          key,
          name,
          isSystem: true,
          permissions: DEFAULT_ROLE_PERMISSIONS[key] ?? [],
          description:
            key === "admin"
              ? "Acceso total al panel"
              : key === "approver"
                ? "Aprobacion de gastos y alertas"
                : "Acceso a la aplicacion PWA",
        },
      });
    }
  }
}

export async function getRoleCatalog(): Promise<RoleCatalogItem[]> {
  await ensureSystemRoles();

  const [roles, counts] = await Promise.all([
    db.role.findMany({ orderBy: [{ isSystem: "desc" }, { name: "asc" }] }),
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const countMap = new Map(counts.map((c) => [c.role, c._count._all]));

  return roles.map((role) => {
    const permissions = Array.isArray(role.permissions)
      ? normalizePermissions(role.permissions as string[])
      : [];

    return {
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions,
      userCount: countMap.get(role.key) ?? 0,
    };
  });
}

export async function createRole(data: {
  name: string;
  description?: string | null;
  permissions?: string[];
}) {
  const trimmed = data.name.trim();
  if (trimmed.length < 2) {
    throw new Error("El nombre del rol debe tener al menos 2 caracteres");
  }

  const baseKey = slugifyRoleKey(trimmed);
  const key = await getUniqueRoleKey(baseKey);
  const permissions = normalizePermissions(data.permissions);

  const role = await db.role.create({
    data: {
      key,
      name: trimmed,
      description: data.description ?? null,
      isSystem: false,
      permissions,
    },
  });

  revalidatePath("/admin/users");
  return { id: role.id, key: role.key, name: role.name };
}

export async function updateRole(data: {
  id: string;
  name?: string;
  description?: string | null;
  permissions?: string[];
}) {
  const role = await db.role.findUnique({ where: { id: data.id } });
  if (!role) throw new Error("Rol no encontrado");

  const updates: {
    name?: string;
    description?: string | null;
    permissions?: string[];
  } = {};

  if (!role.isSystem && data.name) {
    updates.name = data.name.trim();
  }

  if (!role.isSystem && data.description !== undefined) {
    updates.description = data.description ?? null;
  }

  if (data.permissions) {
    updates.permissions = normalizePermissions(data.permissions);
  }

  await db.role.update({
    where: { id: data.id },
    data: updates,
  });

  revalidatePath("/admin/users");
}

export async function deleteRole(id: string) {
  const role = await db.role.findUnique({ where: { id } });
  if (!role) throw new Error("Rol no encontrado");
  if (role.isSystem) throw new Error("No se puede eliminar un rol del sistema");

  const count = await db.user.count({ where: { role: role.key } });
  if (count > 0) {
    throw new Error("No se puede eliminar un rol con usuarios asignados");
  }

  await db.role.delete({ where: { id } });
  revalidatePath("/admin/users");
}
