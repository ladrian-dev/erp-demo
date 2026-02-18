"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { userSchema } from "@/lib/types";
import type { UserFormData, UserItem } from "@/lib/types";

export async function getUsers(): Promise<UserItem[]> {
  const users = await db.user.findMany({
    include: {
      client: { select: { name: true } },
      _count: {
        select: {
          expenses: true,
          approvedExpenses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    createdAt: u.createdAt.toISOString(),
    clientName: u.client?.name ?? null,
    _count: u._count,
  }));
}

export async function createUser(data: UserFormData) {
  const validated = userSchema.parse(data);

  const roleExists = await db.role.findUnique({ where: { key: validated.role } });
  if (!roleExists) {
    throw new Error("El rol seleccionado no existe");
  }

  await db.user.create({
    data: validated,
  });

  revalidatePath("/admin/users");
}

export async function updateUser(id: string, data: UserFormData) {
  const validated = userSchema.parse(data);

  const roleExists = await db.role.findUnique({ where: { key: validated.role } });
  if (!roleExists) {
    throw new Error("El rol seleccionado no existe");
  }

  await db.user.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const expenseCount = await db.expense.count({ where: { userId: id } });
  if (expenseCount > 0) {
    throw new Error("No se puede eliminar un usuario con gastos asociados");
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
