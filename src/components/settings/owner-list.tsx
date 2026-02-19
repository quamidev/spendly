"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteOwner, updateOwner } from "@/lib/actions/owners";
import type { Owner } from "@/lib/types";
import { OwnerForm } from "./owner-form";

interface OwnerListProps {
  owners: Owner[];
}

export function OwnerList({ owners }: OwnerListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    const result = await deleteOwner(deleteId);

    if (result.success) {
      toast.success("Responsable eliminado");
    } else {
      toast.error(result.error ?? "Error al eliminar");
    }

    setDeleteId(null);
  };

  const handleToggleActive = async (owner: Owner) => {
    const result = await updateOwner(owner.id, {
      is_active: !owner.is_active,
    });

    if (result.success) {
      toast.success(
        owner.is_active ? "Responsable desactivado" : "Responsable activado"
      );
    } else {
      toast.error(result.error ?? "Error al actualizar");
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Responsables</h2>
          <p className="text-muted-foreground text-sm">
            Personas o entidades responsables de los gastos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingOwner(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nuevo responsable
        </Button>
      </div>

      {owners.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell>
                    <div
                      className="size-6 rounded-full"
                      style={{ backgroundColor: owner.color_tag }}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(owner)}
                      variant={owner.is_active ? "default" : "secondary"}
                    >
                      {owner.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="ghost">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(owner)}>
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(owner.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>No hay responsables creados</p>
          <Button
            className="mt-4"
            onClick={() => {
              setEditingOwner(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Crear primer responsable
          </Button>
        </div>
      )}

      <OwnerForm
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingOwner(null);
          }
        }}
        open={formOpen}
        owner={editingOwner}
      />

      <AlertDialog onOpenChange={() => setDeleteId(null)} open={!!deleteId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar responsable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los gastos asociados mantendrán
              su responsable pero aparecerá como &quot;Sin responsable&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
