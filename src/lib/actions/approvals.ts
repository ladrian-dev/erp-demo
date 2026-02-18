"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ExpenseWithUser } from "@/lib/types";

export async function getExpenses(
  role: string,
  zone?: string
): Promise<ExpenseWithUser[]> {
  const expenses = await db.expense.findMany({
    where: {
      ...(role === "approver" ? { level: "level_1" } : {}),
      ...(zone ? { client: { zone } } : {}),
    },
    include: {
      user: { select: { name: true, email: true, department: true } },
      approver: { select: { name: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return expenses.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    amount: e.amount,
    category: e.category,
    project: e.project,
    status: e.status,
    level: e.level,
    createdAt: e.createdAt.toISOString(),
    userName: e.user.name,
    userEmail: e.user.email,
    userDepartment: e.user.department,
    approverName: e.approver?.name ?? null,
    clientName: e.client?.name ?? null,
  }));
}

export async function approveExpense(expenseId: string, approverId: string) {
  await db.expense.update({
    where: { id: expenseId },
    data: {
      status: "approved",
      approverId,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/finance-ops");
}

export async function rejectExpense(expenseId: string, approverId: string) {
  await db.expense.update({
    where: { id: expenseId },
    data: {
      status: "rejected",
      approverId,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
