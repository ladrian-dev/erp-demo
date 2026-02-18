"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrencyFull, formatDate } from "@/lib/format";
import { approveExpense, rejectExpense } from "@/lib/actions/approvals";
import type { ExpenseWithUser } from "@/lib/types";
import { useRole } from "@/context/role-context";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ExpenseDetailSheetProps {
  expense: ExpenseWithUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete: () => void;
}

export function ExpenseDetailSheet({
  expense,
  open,
  onOpenChange,
  onActionComplete,
}: ExpenseDetailSheetProps) {
  const { user, hasPermission } = useRole();
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null);

  if (!expense) return null;

  const isPending = expense.status === "pending";
  const canApprove = hasPermission("action.expenses.approve");
  const canReject = hasPermission("action.expenses.reject");

  async function handleApprove() {
    if (!expense) return;
    setIsLoading("approve");
    try {
      await approveExpense(expense.id, user.id);
      toast.success("Gasto aprobado", {
        description: `"${expense.title}" ha sido aprobado.`,
      });
      onOpenChange(false);
      onActionComplete();
    } catch {
      toast.error("Error al aprobar el gasto");
    } finally {
      setIsLoading(null);
    }
  }

  async function handleReject() {
    if (!expense) return;
    setIsLoading("reject");
    try {
      await rejectExpense(expense.id, user.id);
      toast.success("Gasto rechazado", {
        description: `"${expense.title}" ha sido rechazado.`,
      });
      onOpenChange(false);
      onActionComplete();
    } catch {
      toast.error("Error al rechazar el gasto");
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="text-lg">{expense.title}</SheetTitle>
          <SheetDescription>
            Enviado por {expense.userName} · {expense.userDepartment}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2">
            <StatusBadge status={expense.status} />
            <StatusBadge status={expense.level} />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Monto</p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrencyFull(expense.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Categoría</p>
              <p className="text-sm font-medium text-slate-700">
                {expense.category}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Proyecto</p>
              <p className="text-sm font-medium text-slate-700">
                {expense.project}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Fecha</p>
              <p className="text-sm font-medium text-slate-700">
                {formatDate(expense.createdAt)}
              </p>
            </div>
          </div>

          {expense.description && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Descripción
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {expense.description}
                </p>
              </div>
            </>
          )}

          {expense.approverName && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Revisado por
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {expense.approverName}
                </p>
              </div>
            </>
          )}

          {isPending && (canApprove || canReject) && (
            <>
              <Separator />
              <div className="flex gap-3">
                {canApprove && (
                  <Button
                    onClick={handleApprove}
                    disabled={isLoading !== null}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading === "approve" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Aprobar
                  </Button>
                )}
                {canReject && (
                  <Button
                    onClick={handleReject}
                    disabled={isLoading !== null}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isLoading === "reject" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Rechazar
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
