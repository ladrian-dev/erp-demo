"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { VehicleItem } from "@/lib/types";

interface VehicleMapPlaceholderProps {
  vehicles: VehicleItem[];
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

const statusColors: Record<string, string> = {
  active: "text-emerald-500",
  maintenance: "text-amber-500",
  out_of_service: "text-red-500",
};

export function VehicleMapPlaceholder({ vehicles }: VehicleMapPlaceholderProps) {
  const vehiclesWithCoords = vehicles.filter((v) => v.lat !== null && v.lng !== null);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          Ubicación de Flotilla
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] overflow-hidden rounded-lg bg-slate-100">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(8)].map((_, i) => (
              <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-slate-300" style={{ top: `${(i + 1) * 11.1}%` }} />
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={`v-${i}`} className="absolute bottom-0 top-0 border-l border-slate-300" style={{ left: `${(i + 1) * 11.1}%` }} />
            ))}
          </div>

          <div className="absolute left-3 top-3 rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium text-slate-400 backdrop-blur-sm">
            México — Flotilla en Vivo ({vehiclesWithCoords.length} vehículos)
          </div>

          {vehiclesWithCoords.map((vehicle) => (
            <div
              key={vehicle.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${latToPercent(vehicle.lat!)}%`,
                left: `${lngToPercent(vehicle.lng!)}%`,
              }}
            >
              <div className="group relative">
                <MapPin
                  className={`h-6 w-6 drop-shadow-md ${statusColors[vehicle.status] ?? "text-slate-400"}`}
                  fill="currentColor"
                  strokeWidth={1.5}
                  stroke="white"
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {vehicle.make} {vehicle.model} · {vehicle.licensePlate}
                </div>
              </div>
            </div>
          ))}

          {vehiclesWithCoords.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-400">No hay ubicaciones de vehículos disponibles</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
