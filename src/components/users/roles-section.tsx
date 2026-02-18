"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createRole, updateRole, deleteRole } from "@/lib/actions/roles";
import { PERMISSION_GROUPS, type PermissionKey } from "@/lib/permissions";
import { useRole } from "@/context/role-context";
import { toast } from "sonner";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

const DEFAULT_DESCRIPTION = "";

export function RolesSection() {
  const { roles, refreshRoles } = useRole();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<PermissionKey[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState(DEFAULT_DESCRIPTION);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createBaseRoleId, setCreateBaseRoleId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? roles[0] ?? null,
    [roles, selectedRoleId]
  );

  useEffect(() => {
    if (!selectedRole) return;
    setSelectedRoleId(selectedRole.id);
    setDraftPermissions(selectedRole.permissions ?? []);
    setDraftName(selectedRole.name);
    setDraftDescription(selectedRole.description ?? DEFAULT_DESCRIPTION);
  }, [selectedRole]);

  const isDirty = useMemo(() => {
    if (!selectedRole) return false;
    const original = [...new Set(selectedRole.permissions ?? [])].sort().join("|");
    const current = [...new Set(draftPermissions)].sort().join("|");
    return (
      original !== current ||
      (!selectedRole.isSystem &&
        (draftName.trim() !== selectedRole.name ||
          draftDescription.trim() !== (selectedRole.description ?? "")))
    );
  }, [selectedRole, draftPermissions, draftName, draftDescription]);

  function togglePermission(key: PermissionKey) {
    setDraftPermissions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  async function handleSave() {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await updateRole({
        id: selectedRole.id,
        name: selectedRole.isSystem ? undefined : draftName.trim(),
        description: selectedRole.isSystem ? undefined : draftDescription.trim(),
        permissions: draftPermissions,
      });
      toast.success("Permisos actualizados");
      await refreshRoles();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedRole) return;
    setIsDeleting(true);
    try {
      await deleteRole(selectedRole.id);
      toast.success("Rol eliminado");
      await refreshRoles();
      setSelectedRoleId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCreateRole() {
    if (!createName.trim()) {
      toast.error("El nombre del rol es requerido");
      return;
    }
    setIsCreating(true);
    try {
      const baseRole = roles.find((role) => role.id === createBaseRoleId);
      const created = await createRole({
        name: createName.trim(),
        description: createDescription.trim() || null,
        permissions: baseRole?.permissions ?? [],
      });
      toast.success("Rol creado");
      setCreateOpen(false);
      setCreateName("");
      setCreateDescription("");
      setCreateBaseRoleId(null);
      await refreshRoles();
      setSelectedRoleId(created?.id ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear rol");
    } finally {
      setIsCreating(false);
    }
  }

  if (roles.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="py-10 text-center text-sm text-slate-500">
          Cargando roles...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Roles personalizados</h2>
          <p className="text-sm text-slate-500">
            Ajusta modulos, vistas y acciones disponibles para cada rol.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Crear rol
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Listado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role) => {
              const isActive = role.id === selectedRole?.id;
              return (
                <button
                  key={role.id}
                  className={`flex w-full flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <span className="text-sm font-medium">{role.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className={
                        role.isSystem
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }
                    >
                      {role.isSystem ? "Sistema" : "Personalizado"}
                    </Badge>
                    <span className={isActive ? "text-white/70" : "text-slate-400"}>
                      {role.userCount} usuario(s)
                    </span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base text-slate-900">
                  {selectedRole?.name ?? "Selecciona un rol"}
                </CardTitle>
                <p className="text-sm text-slate-500">
                  {selectedRole?.description ?? "Sin descripcion"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!selectedRole?.isSystem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                    )}
                    Eliminar
                  </Button>
                )}
                <Button size="sm" onClick={handleSave} disabled={!isDirty || isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-3.5 w-3.5" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedRole ? (
              <p className="text-sm text-slate-500">
                Selecciona un rol para editar sus permisos.
              </p>
            ) : (
              <>
                {!selectedRole.isSystem && (
                  <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="grid gap-2">
                      <Label htmlFor="role-name">Nombre del rol</Label>
                      <Input
                        id="role-name"
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role-description">Descripcion</Label>
                      <Input
                        id="role-description"
                        value={draftDescription}
                        onChange={(event) => setDraftDescription(event.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Tabs defaultValue="modules">
                  <TabsList>
                    {PERMISSION_GROUPS.map((group) => (
                      <TabsTrigger key={group.id} value={group.id}>
                        {group.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {PERMISSION_GROUPS.map((group) => {
                    const groupKeys = group.permissions.map((permission) => permission.key);
                    const groupSelected = groupKeys.filter((key) =>
                      draftPermissions.includes(key)
                    );
                    const allSelected = groupSelected.length === groupKeys.length;

                    return (
                      <TabsContent key={group.id} value={group.id}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-500">{group.description}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDraftPermissions((prev) => {
                                if (allSelected) {
                                  return prev.filter((key) => !groupKeys.includes(key));
                                }
                                const next = new Set(prev);
                                groupKeys.forEach((key) => next.add(key));
                                return Array.from(next);
                              });
                            }}
                          >
                            {allSelected ? "Quitar todo" : "Marcar todo"}
                          </Button>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid gap-2">
                          {group.permissions.map((permission) => (
                            <label
                              key={permission.key}
                              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                            >
                              <Checkbox
                                checked={draftPermissions.includes(permission.key)}
                                onCheckedChange={() => togglePermission(permission.key)}
                              />
                              <span>{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo rol</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new-role-name">Nombre</Label>
              <Input
                id="new-role-name"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Supervisor de zona"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role-description">Descripcion</Label>
              <Input
                id="new-role-description"
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                placeholder="Acceso limitado a operaciones"
              />
            </div>
            <div className="space-y-2">
              <Label>Copiar permisos de</Label>
              <Select
                value={createBaseRoleId ?? "__none__"}
                onValueChange={(value) =>
                  setCreateBaseRoleId(value === "__none__" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol base" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin copiar</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRole} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear rol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
