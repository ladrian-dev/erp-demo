"use client";

import { useCallback, useEffect, useState } from "react";
import { useRole } from "@/context/role-context";
import { Shield, AlertTriangle, Receipt, Clock } from "lucide-react";
import { toast } from "sonner";
import { createIncident } from "@/lib/actions/incidents";
import { getUserExpenseStats } from "@/lib/actions/expenses";

export function PwaHome() {
  const { user, hasPermission } = useRole();
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [expenseStats, setExpenseStats] = useState<{ total: number; pending: number } | null>(null);
  const canSendPanic = hasPermission("action.panic.send");

  const loadStats = useCallback(async () => {
    if (!user.id || !hasPermission("view.pwa.expenses")) return;
    try {
      const stats = await getUserExpenseStats(user.id);
      setExpenseStats(stats);
    } catch {
      setExpenseStats({ total: 0, pending: 0 });
    }
  }, [user.id, hasPermission]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 8000);
    return () => clearInterval(interval);
  }, [loadStats]);

  async function handlePanic() {
    if (!canSendPanic) return;
    setIsSending(true);
    try {
      await createIncident({
        title: "Botón de pánico activado — " + user.name,
        type: "panic_button",
        severity: "critical",
        description: `El guardia ${user.name} activó el botón de pánico desde la aplicación móvil. Ubicación aproximada basada en último punto conocido.`,
        clientId: "client-001", // Default client
        reportedById: user.id,
      });
      toast.success("🚨 Alerta enviada a Central de Monitoreo", {
        description: "Mantente en tu posición. Apoyo en camino.",
        duration: 5000,
      });
    } catch {
      toast.error("Error al enviar alerta");
    } finally {
      setIsSending(false);
      setShowPanicConfirm(false);
    }
  }

  return (
    <div className="space-y-5 p-4">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Hola, {user.name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-slate-500">Guardia de Seguridad — SecurOps</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-slate-500">Mis Gastos</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {expenseStats?.total ?? "—"}
          </p>
          <p className="text-[10px] text-amber-600">
            {expenseStats?.pending ?? 0} pendientes
          </p>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-slate-500">Próxima Guardia</span>
          </div>
          <p className="mt-1 text-lg font-bold text-slate-900">22:00</p>
          <p className="text-[10px] text-slate-400">Turno nocturno</p>
        </div>
      </div>

      {/* Alerts marquee */}
      <div className="overflow-hidden rounded-xl bg-red-50 p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs font-medium text-red-700">
            Alerta activa: Intrusión perimetral detectada — Sector B, Reynosa
          </p>
        </div>
      </div>

      {/* Panic button */}
      <div className="flex flex-col items-center pt-4">
        <p className="mb-4 text-center text-xs font-medium text-slate-400">
          EMERGENCIA
        </p>
        {showPanicConfirm && canSendPanic ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-sm font-medium text-red-700">
              ¿Confirmas enviar alerta de emergencia?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePanic}
                disabled={isSending}
                className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
              >
                {isSending ? "Enviando..." : "CONFIRMAR"}
              </button>
              <button
                onClick={() => setShowPanicConfirm(false)}
                className="rounded-full bg-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => canSendPanic && setShowPanicConfirm(true)}
            className={`group flex h-32 w-32 flex-col items-center justify-center rounded-full shadow-xl transition-all active:scale-95 ${
              canSendPanic
                ? "bg-red-600 shadow-red-200 hover:bg-red-700 hover:shadow-red-300"
                : "cursor-not-allowed bg-slate-300 shadow-slate-200"
            }`}
          >
            <Shield className="h-10 w-10 text-white" />
            <span className="mt-1 text-xs font-bold tracking-wider text-white">
              PÁNICO
            </span>
          </button>
        )}
        <p className="mt-3 text-center text-[10px] text-slate-400">
          {canSendPanic
            ? "Presiona para enviar alerta a la Central de Monitoreo"
            : "No tienes permisos para activar el boton de panico"}
        </p>
      </div>

      {/* Recent activity */}
      <div className="mt-2 rounded-xl bg-white p-3 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Actividad Reciente</p>
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-700">Check-in registrado — 06:00</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-slate-700">Rondín completado — Sector A</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-slate-700">Gasto enviado — Combustible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
