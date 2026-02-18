"use client";

import { useRole } from "@/context/role-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { PhoneFrame } from "@/components/pwa/phone-frame";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { isEmployee } = useRole();

  if (isEmployee) {
    return <PhoneFrame />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-60">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

