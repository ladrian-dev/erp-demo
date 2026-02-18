"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Wind, Sun } from "lucide-react";
import type { ClientItem } from "@/lib/types";

interface ClientMapOverviewProps {
  clients: ClientItem[];
}

const MAP_BOUNDS = {
  minLat: 14.5,
  maxLat: 33.0,
  minLng: -118.5,
  maxLng: -86.7,
};

function latToPercent(lat: number): number {
  return 100 - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
}

function lngToPercent(lng: number): number {
  return ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
}

const contractColors: Record<string, string> = {
  active: "text-emerald-500",
  pending: "text-amber-500",
  expired: "text-red-500",
};

export function ClientMapOverview({ clients }: ClientMapOverviewProps) {
  const withCoords = clients.filter((c) => c.lat && c.lng);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          Plantas Protegidas — México
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[260px] overflow-hidden rounded-lg bg-slate-100">
          {/* Grid */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-slate-300" style={{ top: `${(i + 1) * 11.1}%` }} />
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={`v-${i}`} className="absolute bottom-0 top-0 border-l border-slate-300" style={{ left: `${(i + 1) * 11.1}%` }} />
            ))}
          </div>

          <div className="absolute left-3 top-3 rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-400 backdrop-blur-sm">
            México — Plantas Protegidas
          </div>

          {withCoords.map((client) => (
            <div
              key={client.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${latToPercent(client.lat!)}%`,
                left: `${lngToPercent(client.lng!)}%`,
              }}
            >
              <div className="group relative">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-2 ${
                  client.contractStatus === "active" ? "ring-emerald-400" : client.contractStatus === "pending" ? "ring-amber-400" : "ring-red-400"
                }`}>
                  {client.siteType === "Eolica" ? (
                    <Wind className="h-3.5 w-3.5 text-sky-500" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {client.siteName}
                </div>
              </div>
            </div>
          ))}

          {withCoords.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-400">No hay ubicaciones disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

