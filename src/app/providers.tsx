"use client";

import { RoleProvider } from "@/context/role-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <RoleProvider>{children}</RoleProvider>;
}
