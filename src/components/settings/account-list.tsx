"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { AccountForm } from "./account-form";

interface AccountListProps {
  accounts: Account[];
}

export function AccountList({ accounts }: AccountListProps) {
  const t = useTranslations("Settings.accounts");
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
      toast.success(t("list.deleted"));
    } else {
      toast.error(result.error ?? t("list.deleteError"));
    }

    setDeleteId(null);
  };

  const handleToggleActive = async (account: Account) => {
    const result = await updateAccount(account.id, {
      is_active: !account.is_active,
    });

    if (result.success) {
      toast.success(
        account.is_active ? t("list.deactivated") : t("list.activated")
      );
    } else {
      toast.error(result.error ?? t("list.updateError"));
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">{t("list.pageTitle")}</h2>
          <p className="text-muted-foreground text-sm">
            {t("list.pageDescription")}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          {t("list.new")}
        </Button>
      </div>

      {accounts.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("list.tableName")}</TableHead>
                <TableHead>{t("list.tableType")}</TableHead>
                <TableHead>{t("list.tableStatus")}</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    {t(`accountTypes.${account.account_type}`)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(account)}
                      variant={account.is_active ? "default" : "secondary"}
                    >
                      {account.is_active ? t("list.active") : t("list.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="ghost">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t("list.actions")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(account)}>
                          <Pencil className="mr-2 size-4" />
                          {t("list.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(account.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          {t("list.delete")}
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
          <p>{t("list.empty")}</p>
          <Button
            className="mt-4"
            onClick={() => {
              setEditingAccount(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            {t("list.createFirst")}
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
            <AlertDialogTitle>{t("list.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("list.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {t("list.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
