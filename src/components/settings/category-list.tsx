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
import { deleteCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";
import { CategoryForm } from "./category-form";

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    const result = await deleteCategory(deleteId);

    if (result.success) {
      toast.success("Categoría eliminada");
    } else {
      toast.error(result.error ?? "Error al eliminar");
    }

    setDeleteId(null);
  };

  const handleToggleActive = async (category: Category) => {
    const result = await updateCategory(category.id, {
      is_active: !category.is_active,
    });

    if (result.success) {
      toast.success(
        category.is_active ? "Categoría desactivada" : "Categoría activada"
      );
    } else {
      toast.error(result.error ?? "Error al actualizar");
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Categorías</h2>
          <p className="text-muted-foreground text-sm">
            Categorías para clasificar tus gastos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nueva categoría
        </Button>
      </div>

      {categories.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Palabras clave
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {category.keywords && category.keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {category.keywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                        {category.keywords.length > 3 && (
                          <Badge variant="secondary">
                            +{category.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(category)}
                      variant={category.is_active ? "default" : "secondary"}
                    >
                      {category.is_active ? "Activa" : "Inactiva"}
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
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(category.id)}
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
          <p>No hay categorías creadas</p>
          <Button
            className="mt-4"
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Crear primera categoría
          </Button>
        </div>
      )}

      <CategoryForm
        category={editingCategory}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
        open={formOpen}
      />

      <AlertDialog onOpenChange={() => setDeleteId(null)} open={!!deleteId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los gastos asociados mantendrán
              su categoría pero aparecerá como &quot;Sin categoría&quot;.
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
