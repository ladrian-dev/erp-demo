"use client";

import { useCallback, useEffect, useState } from "react";
import { useRole } from "@/context/role-context";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatRelativeDate } from "@/lib/format";
import { Camera, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createExpense, getUserExpenses } from "@/lib/actions/expenses";
import { getClients } from "@/lib/actions/clients";
import type { ClientItem, UserExpenseItem } from "@/lib/types";

const CATEGORY_OPTIONS = [
  "Combustible",
  "Uniformes",
  "Transporte",
  "Comunicaciones",
  "Equipamiento",
  "Hospedaje",
];

export function PwaExpenses() {
  const { user, hasPermission } = useRole();
  const [showForm, setShowForm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [expenses, setExpenses] = useState<UserExpenseItem[] | null>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: CATEGORY_OPTIONS[0],
    clientId: "",
  });

  const canView = hasPermission("view.pwa.expenses");
  const canCreate = hasPermission("action.expenses.create");

  const loadExpenses = useCallback(async () => {
    if (!canView || !user.id) return;
    try {
      const data = await getUserExpenses(user.id);
      setExpenses(data);
    } catch {
      setExpenses([]);
    }
  }, [canView, user.id]);

  useEffect(() => {
    if (!canView) return;
    loadExpenses();
    const interval = setInterval(loadExpenses, 8000);
    return () => clearInterval(interval);
  }, [loadExpenses, canView]);

  useEffect(() => {
    getClients().then(setClients).catch(() => setClients([]));
  }, []);

  async function handleSubmit() {
    if (!canCreate) {
      toast.error("No tienes permisos para crear gastos");
      return;
    }

    const amount = Number(form.amount);
    if (!form.title.trim() || Number.isNaN(amount) || amount <= 0) {
      toast.error("Completa los datos del gasto");
      return;
    }

    setIsSending(true);
    try {
      await createExpense({
        title: form.title.trim(),
        amount,
        category: form.category,
        project: "Operacion",
        clientId: form.clientId || undefined,
        userId: user.id,
      });
      toast.success("Gasto enviado", {
        description: "Tu gasto ha sido enviado para aprobacion.",
      });
      setForm({
        title: "",
        amount: "",
        category: CATEGORY_OPTIONS[0],
        clientId: "",
      });
      setShowForm(false);
      loadExpenses();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al enviar gasto");
    } finally {
      setIsSending(false);
    }
  }

  if (!canView) {
    return (
      <div className="p-4">
        <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          No tienes permisos para ver gastos.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Mis Gastos</h2>
        {canCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition-all active:scale-95"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-4 space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Nuevo Gasto</p>
          <input
            type="text"
            placeholder="Concepto"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Monto"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <select
            value={form.clientId}
            onChange={(event) => setForm({ ...form, clientId: event.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.siteName}
              </option>
            ))}
          </select>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-sm text-slate-500 transition-colors hover:border-slate-400">
            <Camera className="h-4 w-4" />
            Adjuntar comprobante
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSending}
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSending ? "Enviando..." : "Enviar Gasto"}
          </button>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {expenses?.map((expense) => (
          <div
            key={expense.id}
            className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {expense.title}
              </p>
              <p className="text-[11px] text-slate-400">
                {expense.category} · {expense.clientName ?? "General"} · {formatRelativeDate(expense.createdAt)}
              </p>
            </div>
            <div className="ml-3 flex items-center gap-2">
              <StatusBadge status={expense.status} />
              <span className="text-sm font-semibold text-slate-700">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          </div>
        ))}
        {expenses?.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            Aun no tienes gastos registrados.
          </div>
        )}
        {!expenses && (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
            Cargando gastos...
          </div>
        )}
      </div>
    </div>
  );
}
