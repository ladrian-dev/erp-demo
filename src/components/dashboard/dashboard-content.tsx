"use client";

import { useRole } from "@/context/role-context";
import { Card } from "@/components/ui/card";
import { AdminDashboard } from "./admin-dashboard";
import { ApproverDashboard } from "./approver-dashboard";

export function DashboardContent() {
  const { isAdmin, hasPermission } = useRole();

  if (!hasPermission("module.dashboard")) {
    return (
      <Card className="flex h-64 items-center justify-center border-slate-200 bg-white">
        <p className="text-sm text-slate-500">
          No tienes permisos para ver el Centro de Control.
        </p>
      </Card>
    );
  }

  return isAdmin ? <AdminDashboard /> : <ApproverDashboard />;
}
