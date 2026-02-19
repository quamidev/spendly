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
import { deleteAccount, updateAccount } from "@/lib/actions/accounts";
import type { Account } from "@/lib/types";
import { ACCOUNT_TYPE_LABELS } from "@/lib/types";
import { AccountForm } from "./account-form";

interface AccountListProps {
  accounts: Account[];
}

export function AccountList({ accounts }: AccountListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    const result = await deleteAccount(deleteId);

    if (result.success) {
      toast.success("Cuenta eliminada");
    } else {
      toast.error(result.error ?? "Error al eliminar");
    }

    setDeleteId(null);
  };

  const handleToggleActive = async (account: Account) => {
    const result = await updateAccount(account.id, {
      is_active: !account.is_active,
    });

    if (result.success) {
      toast.success(
        account.is_active ? "Cuenta desactivada" : "Cuenta activada"
      );
    } else {
      toast.error(result.error ?? "Error al actualizar");
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Cuentas</h2>
          <p className="text-muted-foreground text-sm">
            Cuentas de donde sale el dinero para tus gastos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Nueva cuenta
        </Button>
      </div>

      {accounts.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    {ACCOUNT_TYPE_LABELS[account.account_type]}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(account)}
                      variant={account.is_active ? "default" : "secondary"}
                    >
                      {account.is_active ? "Activa" : "Inactiva"}
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
                        <DropdownMenuItem onClick={() => handleEdit(account)}>
                          <Pencil className="mr-2 size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(account.id)}
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
          <p>No hay cuentas creadas</p>
          <Button
            className="mt-4"
            onClick={() => {
              setEditingAccount(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Crear primera cuenta
          </Button>
        </div>
      )}

      <AccountForm
        account={editingAccount}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingAccount(null);
          }
        }}
        open={formOpen}
      />

      <AlertDialog onOpenChange={() => setDeleteId(null)} open={!!deleteId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los gastos asociados mantendrán
              su cuenta pero aparecerá como &quot;Sin cuenta&quot;.
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
