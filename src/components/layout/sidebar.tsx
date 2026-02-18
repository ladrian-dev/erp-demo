"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Building2,
  Package,
  Users,
  Building,
  Bell,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/context/role-context";
import { getIncidentStats } from "@/lib/actions/incidents";

const navigation = [
  {
    name: "Centro de Control",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "module.dashboard",
    badge: false,
  },
  {
    name: "Centro de Gastos",
    href: "/expenses",
    icon: Receipt,
    permission: "module.expenses",
    badge: false,
  },
  {
    name: "Freemática",
    href: "/finance-ops",
    icon: Building2,
    permission: "module.finance-ops",
    badge: false,
  },
  {
    name: "Clientes",
    href: "/clients",
    icon: Building,
    permission: "module.clients",
    badge: false,
  },
  {
    name: "Alertas",
    href: "/notifications",
    icon: Bell,
    permission: "module.notifications",
    badge: true,
  },
  {
    name: "Inventario",
    href: "/resources",
    icon: Package,
    permission: "module.resources",
    badge: false,
  },
  {
    name: "Colaboradores",
    href: "/admin/users",
    icon: Users,
    permission: "module.admin.users",
    badge: false,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, zone, hasPermission } = useRole();
  const [openIncidents, setOpenIncidents] = useState<number>(0);

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      const stats = await getIncidentStats(zone ?? undefined);
      if (active) setOpenIncidents(stats.open);
    };
    loadStats();
    const interval = setInterval(loadStats, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [zone]);

  if (role === "employee") return null;

  const filteredNav = navigation.filter((item) => hasPermission(item.permission));

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-60 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-900">
          SecurOps
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && openIncidents > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {openIncidents > 99 ? "99+" : openIncidents}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-400">SecurOps — Demo Ejecutiva v2.0</p>
      </div>
    </aside>
  );
}
