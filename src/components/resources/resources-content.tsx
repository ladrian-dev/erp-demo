"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AssetsTable } from "./assets-table";
import { VehiclesTable } from "./vehicles-table";
import { VehicleMapPlaceholder } from "./vehicle-map-placeholder";
import { VehicleDetailSheet } from "./vehicle-detail-sheet";
import { AssetDialog } from "./asset-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAssets,
  getVehicles,
  getVehicleDetail,
} from "@/lib/actions/resources";
import type {
  AssetItem,
  VehicleItem,
  VehicleDetail,
  AssetFormData,
} from "@/lib/types";
import { useRole } from "@/context/role-context";
import { PlusCircle } from "lucide-react";

export function ResourcesContent() {
  const { isAdmin } = useRole();
  const [assets, setAssets] = useState<AssetItem[] | null>(null);
  const [vehicles, setVehicles] = useState<VehicleItem[] | null>(null);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [vehicleDetail, setVehicleDetail] = useState<VehicleDetail | null>(
    null,
  );
  const [vehicleSheetOpen, setVehicleSheetOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [a, v] = await Promise.all([getAssets(), getVehicles()]);
    setAssets(a);
    setVehicles(v);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreateAsset() {
    setEditingAsset(null);
    setAssetDialogOpen(true);
  }

  function handleEditAsset(asset: AssetItem) {
    console.log(asset);
    setEditingAsset(asset);
    setAssetDialogOpen(true);
  }

  async function handleVehicleClick(vehicle: VehicleItem) {
    const detail = await getVehicleDetail(vehicle.id);
    if (detail) {
      setVehicleDetail(detail);
      setVehicleSheetOpen(true);
    }
  }

  if (!assets || !vehicles) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="inventory" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="inventory">
              Inventario ({assets.length})
            </TabsTrigger>
            <TabsTrigger value="fleet">
              Flotilla ({vehicles.length})
            </TabsTrigger>
          </TabsList>

          {isAdmin && (
            <Button onClick={handleCreateAsset}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Activo
            </Button>
          )}
        </div>

        <TabsContent value="inventory" className="mt-4">
          <AssetsTable
            data={assets}
            onEdit={handleEditAsset}
            onRefresh={loadData}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="fleet" className="mt-4 space-y-4">
          <VehicleMapPlaceholder vehicles={vehicles} />
          <VehiclesTable data={vehicles} onRowClick={handleVehicleClick} />
        </TabsContent>
      </Tabs>

      <AssetDialog
        open={assetDialogOpen}
        onOpenChange={setAssetDialogOpen}
        asset={editingAsset}
        onSuccess={loadData}
      />

      <VehicleDetailSheet
        vehicle={vehicleDetail}
        open={vehicleSheetOpen}
        onOpenChange={setVehicleSheetOpen}
      />
    </>
  );
}
