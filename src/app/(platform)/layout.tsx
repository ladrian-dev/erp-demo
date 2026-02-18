import { RoleProvider } from "@/context/role-context";
import { PlatformShell } from "@/components/layout/platform-shell";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <TooltipProvider>
        <PlatformShell>{children}</PlatformShell>
      </TooltipProvider>
    </RoleProvider>
  );
}
