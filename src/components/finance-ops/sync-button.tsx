"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";

interface SyncButtonProps {
  selectedCount: number;
  isLoading: boolean;
  onClick: () => void;
}

export function SyncButton({
  selectedCount,
  isLoading,
  onClick,
}: SyncButtonProps) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={selectedCount === 0 || isLoading}
      className="bg-slate-900 hover:bg-slate-800"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Sincronizando a Freemática...
        </>
      ) : (
        <>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sincronizar a Freemática
          {selectedCount > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {selectedCount}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
