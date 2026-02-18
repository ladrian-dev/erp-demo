"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientsTable } from "./clients-table";
import { ClientDetailSheet } from "./client-detail-sheet";
import { ClientMapOverview } from "./client-map-overview";
import { Skeleton } from "@/components/ui/skeleton";
import { getClients, getClientDetail } from "@/lib/actions/clients";
import type { ClientItem, ClientDetail } from "@/lib/types";
import { ZONES } from "@/lib/types";
import { useRole } from "@/context/role-context";

export function ClientsContent() {
  const { zone: globalZone } = useRole();
  const [clients, setClients] = useState<ClientItem[] | null>(null);
  const [activeZone, setActiveZone] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Effective zone: global zone takes priority when set, else local tab
  const effectiveZone = globalZone ?? (activeZone === "all" ? undefined : activeZone);

  const loadClients = useCallback(async () => {
    const data = await getClients(effectiveZone);
    setClients(data);
  }, [effectiveZone]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  async function handleRowClick(client: ClientItem) {
    const detail = await getClientDetail(client.id);
    if (detail) {
      setSelectedClient(detail);
      setSheetOpen(true);
    }
  }

  if (!clients) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientMapOverview clients={clients} />

      <Tabs value={activeZone} onValueChange={setActiveZone} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({clients.length})</TabsTrigger>
          {ZONES.map((zone) => {
            const count = clients.filter((c) => c.zone === zone).length;
            return (
              <TabsTrigger key={zone} value={zone}>
                {zone} {activeZone === "all" && count > 0 ? `(${count})` : ""}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeZone} className="mt-4">
          <ClientsTable data={clients} onRowClick={handleRowClick} />
        </TabsContent>
      </Tabs>

      <ClientDetailSheet
        client={selectedClient}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}

