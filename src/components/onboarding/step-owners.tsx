"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { createOwner, deleteOwner, getOwners } from "@/lib/actions/owners";
import type { Owner } from "@/lib/types";
import { OWNER_COLOR_PRESETS } from "@/lib/types";

interface OwnerToCreate {
  id: string;
  name: string;
  color_tag: string;
}

interface StepOwnersProps {
  onBack: () => void;
}

export function StepOwners({ onBack }: StepOwnersProps) {
  const router = useRouter();
  const [existingOwners, setExistingOwners] = useState<Owner[]>([]);
  const [newOwners, setNewOwners] = useState<OwnerToCreate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Load existing owners on mount
  useEffect(() => {
    async function loadOwners() {
      try {
        const owners = await getOwners();
        setExistingOwners(owners);
        // If no existing owners, add a default one
        if (owners.length === 0) {
          setNewOwners([
            {
              id: crypto.randomUUID(),
              name: "Yo",
              color_tag: OWNER_COLOR_PRESETS[0],
            },
          ]);
        }
      } catch {
        setNewOwners([
          {
            id: crypto.randomUUID(),
            name: "Yo",
            color_tag: OWNER_COLOR_PRESETS[0],
          },
        ]);
      }
      setLoadingExisting(false);
    }
    loadOwners();
  }, []);

  const handleDeleteExisting = async (id: string, name: string) => {
    const result = await deleteOwner(id);
    if (result.success) {
      setExistingOwners((prev) => prev.filter((o) => o.id !== id));
      toast.success(`${name} eliminado`);
    } else {
      toast.error(result.error);
    }
  };

  const getNextColor = () => {
    const usedColors = [
      ...existingOwners.map((o) => o.color_tag),
      ...newOwners.map((o) => o.color_tag),
    ];
    const availableColor = OWNER_COLOR_PRESETS.find(
      (c) => !usedColors.includes(c)
    );
    return (
      availableColor ||
      OWNER_COLOR_PRESETS[
        (existingOwners.length + newOwners.length) % OWNER_COLOR_PRESETS.length
      ]
    );
  };

  const addNewOwner = () => {
    setNewOwners([
      ...newOwners,
      { id: crypto.randomUUID(), name: "", color_tag: getNextColor() },
    ]);
  };

  const removeNewOwner = (id: string) => {
    setNewOwners(newOwners.filter((o) => o.id !== id));
  };

  const updateNewOwner = (
    id: string,
    field: "name" | "color_tag",
    value: string
  ) => {
    setNewOwners(
      newOwners.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  const handleSubmit = async () => {
    const validNewOwners = newOwners.filter((o) => o.name.trim());

    // Check for duplicates against existing owners
    for (const owner of validNewOwners) {
      const existsInExisting = existingOwners.some(
        (o) => o.name.toLowerCase() === owner.name.trim().toLowerCase()
      );
      if (existsInExisting) {
        toast.error(`El responsable "${owner.name}" ya existe`);
        return;
      }
    }

    // Check for duplicates within new owners
    const names = validNewOwners.map((o) => o.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      toast.error("No puedes agregar responsables con el mismo nombre");
      return;
    }

    setLoading(true);

    for (const owner of validNewOwners) {
      const result = await createOwner({
        name: owner.name.trim(),
        color_tag: owner.color_tag,
      });
      if ("error" in result) {
        toast.error(`Error al crear ${owner.name}`);
      }
    }

    // Mark onboarding as completed
    const result = await completeOnboarding();

    setLoading(false);

    if (result.success) {
      toast.success("¡Configuración completada!");
      router.push("/dashboard");
    } else {
      toast.error("Error al completar la configuración");
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    const result = await completeOnboarding();
    setLoading(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      toast.error("Error al completar la configuración");
    }
  };

  const hasOwners = existingOwners.length > 0 || newOwners.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Responsables de gastos</h2>
        <p className="text-muted-foreground text-sm">
          {existingOwners.length > 0
            ? "Estos son los responsables actuales. Puedes eliminarlos o agregar más."
            : "Si compartes gastos con otras personas, agrégalas aquí. Este paso es opcional."}
        </p>
      </div>

      {/* Loading state */}
      {loadingExisting ? (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-muted-foreground text-sm">Cargando...</span>
        </div>
      ) : (
        <>
          {/* Existing owners */}
          {existingOwners.length > 0 && (
            <div className="space-y-2">
              <Label>Responsables creados</Label>
              <div className="space-y-2">
                {existingOwners.map((owner) => (
                  <div
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                    key={owner.id}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="size-6 rounded-full"
                        style={{ backgroundColor: owner.color_tag }}
                      />
                      <span className="font-medium text-sm">{owner.name}</span>
                    </div>
                    <Button
                      onClick={() => handleDeleteExisting(owner.id, owner.name)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New owners to create */}
          {newOwners.length > 0 && (
            <div className="space-y-2">
              {existingOwners.length > 0 && <Label>Agregar nuevos</Label>}
              <div className="space-y-3">
                {newOwners.map((owner) => (
                  <div
                    className="flex flex-col gap-2 rounded-lg border p-2 sm:flex-row sm:items-center sm:border-0 sm:p-0"
                    key={owner.id}
                  >
                    <div className="flex-1">
                      <Label className="sr-only">Nombre</Label>
                      <Input
                        onChange={(e) =>
                          updateNewOwner(owner.id, "name", e.target.value)
                        }
                        placeholder="Nombre del responsable"
                        value={owner.name}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        {OWNER_COLOR_PRESETS.slice(0, 5).map((color) => (
                          <button
                            className={`size-8 rounded-md border-2 transition-all sm:size-9 ${
                              owner.color_tag === color
                                ? "scale-110 border-foreground"
                                : "border-transparent"
                            }`}
                            key={color}
                            onClick={() =>
                              updateNewOwner(owner.id, "color_tag", color)
                            }
                            style={{ backgroundColor: color }}
                            type="button"
                          />
                        ))}
                      </div>
                      <Button
                        className="shrink-0"
                        onClick={() => removeNewOwner(owner.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Button className="w-full" onClick={addNewOwner} variant="outline">
        <Plus className="mr-2 size-4" />
        Agregar {hasOwners ? "otra " : ""}persona
      </Button>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost">
          Atrás
        </Button>
        <div className="flex gap-2">
          <Button disabled={loading} onClick={handleSkip} variant="ghost">
            Omitir
          </Button>
          <Button disabled={loading || loadingExisting} onClick={handleSubmit}>
            {loading ? "Guardando..." : "Finalizar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
