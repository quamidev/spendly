"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOwner, updateOwner } from "@/lib/actions/owners";
import type { Owner } from "@/lib/types";
import { OWNER_COLOR_PRESETS } from "@/lib/types";

interface OwnerFormProps {
  owner?: Owner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerForm({ owner, open, onOpenChange }: OwnerFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(owner?.name ?? "");
  const [colorTag, setColorTag] = useState(
    owner?.color_tag ?? OWNER_COLOR_PRESETS[0]
  );

  const isEditing = !!owner;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setLoading(true);

    const data = {
      name: name.trim(),
      color_tag: colorTag,
    };

    if (isEditing) {
      const result = await updateOwner(owner.id, data);
      setLoading(false);
      if (result.success) {
        toast.success("Responsable actualizado");
        onOpenChange(false);
        setName("");
        setColorTag(OWNER_COLOR_PRESETS[0]);
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createOwner(data);
      setLoading(false);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Responsable creado");
        onOpenChange(false);
        setName("");
        setColorTag(OWNER_COLOR_PRESETS[0]);
      }
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar responsable" : "Nuevo responsable"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifica los datos del responsable"
                : "Crea un nuevo responsable para identificar quién hizo el gasto"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Personal, Empresa, Jefe"
                required
                value={name}
              />
            </div>

            <div className="space-y-2">
              <Label>Color identificador</Label>
              <div className="flex flex-wrap gap-2">
                {OWNER_COLOR_PRESETS.map((color) => (
                  <button
                    aria-label={`Color ${color}`}
                    className={`size-8 rounded-full transition-all ${
                      colorTag === color
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    key={color}
                    onClick={() => setColorTag(color)}
                    style={{ backgroundColor: color }}
                    type="button"
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Este color aparecerá junto a los gastos de este responsable
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button disabled={loading} type="submit">
              {loading && "Guardando..."}
              {!loading && isEditing && "Guardar"}
              {!(loading || isEditing) && "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
