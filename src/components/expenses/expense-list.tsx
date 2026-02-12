"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Receipt,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteExpense } from "@/lib/actions/expenses";
import type {
  Account,
  Category,
  ExpenseWithRelations,
  Owner,
} from "@/lib/types";
import { DEFAULT_PAGE_SIZE } from "@/lib/types";

interface ExpenseListProps {
  expenses: ExpenseWithRelations[];
  totalCount: number;
  categories: Category[];
  accounts: Account[];
  owners: Owner[];
  currentPage: number;
  filters: {
    categoryId?: string;
    accountId?: string;
    ownerId?: string;
  };
}

const NONE_VALUE = "__none__";

export function ExpenseList({
  expenses,
  totalCount,
  categories,
  accounts,
  owners,
  currentPage,
  filters,
}: ExpenseListProps) {
  const t = useTranslations("Expenses");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(`${dateStr}T12:00:00`).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== NONE_VALUE) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/expenses?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    router.push(`/expenses?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }
    setIsDeleting(true);
    try {
      const result = await deleteExpense(deleteId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(t("list.deleted"));
      router.refresh();
    } catch {
      toast.error(t("list.deleteError"));
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          onValueChange={(v) => updateFilter("categoryId", v)}
          value={filters.categoryId ?? NONE_VALUE}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>
              {t("filters.allCategories")}
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => updateFilter("accountId", v)}
          value={filters.accountId ?? NONE_VALUE}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.allAccounts")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>
              {t("filters.allAccounts")}
            </SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => updateFilter("ownerId", v)}
          value={filters.ownerId ?? NONE_VALUE}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("filters.allOwners")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>{t("filters.allOwners")}</SelectItem>
            {owners.map((own) => (
              <SelectItem key={own.id} value={own.id}>
                {own.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">{t("list.empty")}</p>
            <p className="mb-4 text-muted-foreground text-sm">
              {t("list.emptyDescription")}
            </p>
            <Button asChild>
              <Link href="/expenses/new">{t("list.createFirst")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.date")}</TableHead>
                    <TableHead>{t("table.description")}</TableHead>
                    <TableHead>{t("table.category")}</TableHead>
                    <TableHead>{t("table.account")}</TableHead>
                    <TableHead>{t("table.owner")}</TableHead>
                    <TableHead className="text-right">
                      {t("table.amount")}
                    </TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {expense.description}
                          </span>
                          {expense.notes && (
                            <p className="text-muted-foreground text-xs">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {expense.categories ? (
                          <Badge variant="secondary">
                            {expense.categories.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.accounts?.name ?? (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.owners ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: expense.owners.color_tag,
                              }}
                            />
                            {expense.owners.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(expense.amount, expense.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/expenses/${expense.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            onClick={() => setDeleteId(expense.id)}
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium">{expense.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                        <span>{formatDate(expense.date)}</span>
                        {expense.categories && (
                          <Badge className="text-xs" variant="secondary">
                            {expense.categories.name}
                          </Badge>
                        )}
                        {expense.owners && (
                          <span className="flex items-center gap-1">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: expense.owners.color_tag,
                              }}
                            />
                            {expense.owners.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold">
                        {formatCurrency(expense.amount, expense.currency)}
                      </p>
                      <div className="mt-1 flex gap-1">
                        <Button asChild size="icon" variant="ghost">
                          <Link href={`/expenses/${expense.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          onClick={() => setDeleteId(expense.id)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {t("pagination.showing", {
                  from: (currentPage - 1) * DEFAULT_PAGE_SIZE + 1,
                  to: Math.min(currentPage * DEFAULT_PAGE_SIZE, totalCount),
                  total: totalCount,
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={currentPage <= 1}
                  onClick={() => goToPage(currentPage - 1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  disabled={currentPage >= totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  size="icon"
                  variant="outline"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
        open={!!deleteId}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("list.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("list.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
              {t("list.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
