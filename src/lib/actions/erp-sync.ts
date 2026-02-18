"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { SyncableExpense, SyncLogEntry } from "@/lib/types";

export async function getApprovedExpenses(): Promise<SyncableExpense[]> {
  const expenses = await db.expense.findMany({
    where: { status: "approved" },
    include: {
      user: { select: { name: true } },
      approver: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return expenses.map((e) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: e.category,
    project: e.project,
    userName: e.user.name,
    approverName: e.approver?.name ?? null,
    createdAt: e.createdAt.toISOString(),
  }));
}

export async function getSyncHistory(): Promise<SyncLogEntry[]> {
  const logs = await db.erpSync.findMany({
    include: {
      expense: { select: { title: true, amount: true } },
    },
    orderBy: { syncedAt: "desc" },
  });

  return logs.map((log) => ({
    id: log.id,
    reference: log.reference,
    status: log.status,
    syncedAt: log.syncedAt.toISOString(),
    expenseTitle: log.expense.title,
    expenseAmount: log.expense.amount,
  }));
}

export async function syncToErp(expenseIds: string[]) {
  // Simulate network delay (2-3 seconds)
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Update expenses and create sync logs
  for (const expenseId of expenseIds) {
    const reference = `FRM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    await db.expense.update({
      where: { id: expenseId },
      data: { status: "synced" },
    });

    await db.erpSync.create({
      data: {
        expenseId,
        status: "synced",
        reference,
        syncedAt: new Date(),
      },
    });
  }

  revalidatePath("/finance-ops");
  revalidatePath("/dashboard");
  revalidatePath("/expenses");

  return { count: expenseIds.length };
}
