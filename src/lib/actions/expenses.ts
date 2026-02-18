"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import type { UserExpenseItem } from "@/lib/types";

const expenseFormSchema = z.object({
  title: z.string().min(2, "El titulo es requerido"),
  amount: z.number().positive("El monto debe ser mayor a cero"),
  category: z.string().min(1, "La categoria es requerida"),
  project: z.string().optional(),
  description: z.string().optional(),
  clientId: z.string().optional(),
  userId: z.string().min(1, "Usuario requerido"),
});

export async function getUserExpenses(userId: string): Promise<UserExpenseItem[]> {
  const expenses = await db.expense.findMany({
    where: { userId },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return expenses.map((expense) => ({
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    status: expense.status,
    createdAt: expense.createdAt.toISOString(),
    clientName: expense.client?.name ?? null,
  }));
}

export async function getUserExpenseStats(userId: string) {
  const [total, pending] = await Promise.all([
    db.expense.count({ where: { userId } }),
    db.expense.count({ where: { userId, status: "pending" } }),
  ]);

  return { total, pending };
}

export async function createExpense(data: {
  title: string;
  amount: number;
  category: string;
  project?: string;
  description?: string;
  clientId?: string;
  userId: string;
}) {
  const validated = expenseFormSchema.parse(data);

  await db.expense.create({
    data: {
      title: validated.title,
      amount: validated.amount,
      category: validated.category,
      project: validated.project ?? "Operacion",
      description: validated.description ?? null,
      status: "pending",
      level: "level_1",
      clientId: validated.clientId || null,
      userId: validated.userId,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/finance-ops");
  revalidatePath("/notifications");
}
