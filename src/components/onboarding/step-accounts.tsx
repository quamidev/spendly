"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAccount,
  deleteAccount,
  getAccounts,
} from "@/lib/actions/accounts";
import type { Account, AccountType } from "@/lib/types";
import { ACCOUNT_TYPES } from "@/lib/types";

interface AccountToCreate {
  id: string;
  name: string;
  account_type: AccountType;
}

interface StepAccountsProps {
  onBack: () => void;
  onNext: () => void;
}

export function StepAccounts({ onBack, onNext }: StepAccountsProps) {
  const t = useTranslations("Onboarding.accounts");
  const tAccounts = useTranslations("Settings.accounts");
  const [existingAccounts, setExistingAccounts] = useState<Account[]>([]);
  const [newAccounts, setNewAccounts] = useState<AccountToCreate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  // Load existing accounts on mount
  useEffect(() => {
    async function loadAccounts() {
      try {
        const accounts = await getAccounts();
        setExistingAccounts(accounts);
        // If no existing accounts, add a default one to create
        if (accounts.length === 0) {
          setNewAccounts([
            { id: crypto.randomUUID(), name: "Efectivo", account_type: "cash" },
          ]);
        }
      } catch {
        setNewAccounts([
          { id: crypto.randomUUID(), name: "Efectivo", account_type: "cash" },
        ]);
      }
      setLoadingExisting(false);
    }
    loadAccounts();
  }, []);

  const handleDeleteExisting = async (id: string, name: string) => {
    const result = await deleteAccount(id);
    if (result.success) {
      setExistingAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success(t("deleted", { name }));
    } else {
      toast.error(result.error);
    }
  };

  const addNewAccount = () => {
    setNewAccounts([
      ...newAccounts,
      { id: crypto.randomUUID(), name: "", account_type: "credit_card" },
    ]);
  };

  const removeNewAccount = (id: string) => {
    setNewAccounts(newAccounts.filter((a) => a.id !== id));
  };

  const updateNewAccount = (
    id: string,
    field: "name" | "account_type",
    value: string
  ) => {
    setNewAccounts(
      newAccounts.map((a) => {
        if (a.id !== id) {
          return a;
        }
        if (field === "account_type") {
          return { ...a, account_type: value as AccountType };
        }
        return { ...a, name: value };
      })
    );
  };

  const handleSubmit = async () => {
    const validNewAccounts = newAccounts.filter((a) => a.name.trim());

    // If no existing and no new accounts, require at least one
    if (existingAccounts.length === 0 && validNewAccounts.length === 0) {
      toast.error(t("atLeastOne"));
      return;
    }

    // Check for duplicates against existing accounts (same name AND same type)
    for (const account of validNewAccounts) {
      const existsInExisting = existingAccounts.some(
        (a) =>
          a.name.toLowerCase() === account.name.trim().toLowerCase() &&
          a.account_type === account.account_type
      );
      if (existsInExisting) {
        toast.error(
          t("duplicateExisting", {
            name: account.name,
            type: tAccounts(`accountTypes.${account.account_type}`),
          })
        );
        return;
      }
    }

    // Check for duplicates within new accounts (same name AND same type)
    const keys = validNewAccounts.map(
      (a) => `${a.name.trim().toLowerCase()}-${a.account_type}`
    );
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      toast.error(t("duplicateNew"));
      return;
    }

    if (validNewAccounts.length > 0) {
      setLoading(true);

      for (const account of validNewAccounts) {
        const result = await createAccount({
          name: account.name.trim(),
          account_type: account.account_type,
        });
        if ("error" in result) {
          toast.error(t("createError", { name: account.name }));
        }
      }

      setLoading(false);
      toast.success(t("created"));
    }

    onNext();
  };

  const hasAccounts = existingAccounts.length > 0 || newAccounts.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">
          {existingAccounts.length > 0
            ? t("descriptionExisting")
            : t("descriptionNew")}
        </p>
      </div>

      {/* Loading state */}
      {loadingExisting ? (
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-muted-foreground text-sm">{t("loading")}</span>
        </div>
      ) : (
        <>
          {/* Existing accounts */}
          {existingAccounts.length > 0 && (
            <div className="space-y-2">
              <Label>{t("existingLabel")}</Label>
              <div className="space-y-2">
                {existingAccounts.map((account) => (
                  <div
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                    key={account.id}
                  >
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                      <span className="font-medium text-sm">
                        {account.name}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {tAccounts(`accountTypes.${account.account_type}`)}
                      </span>
                    </div>
                    <Button
                      onClick={() =>
                        handleDeleteExisting(account.id, account.name)
                      }
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

          {/* New accounts to create */}
          {newAccounts.length > 0 && (
            <div className="space-y-2">
              {existingAccounts.length > 0 && (
                <Label>{t("addNewLabel")}</Label>
              )}
              <div className="space-y-3">
                {newAccounts.map((account) => (
                  <div
                    className="flex items-start gap-2 rounded-lg border p-2 sm:items-center sm:border-0 sm:p-0"
                    key={account.id}
                  >
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                      <div className="flex-1">
                        <Label className="sr-only">{tAccounts("name")}</Label>
                        <Input
                          onChange={(e) =>
                            updateNewAccount(account.id, "name", e.target.value)
                          }
                          placeholder={t("namePlaceholder")}
                          value={account.name}
                        />
                      </div>
                      <div className="w-full sm:w-40">
                        <Label className="sr-only">{tAccounts("type")}</Label>
                        <Select
                          onValueChange={(value) =>
                            updateNewAccount(account.id, "account_type", value)
                          }
                          value={account.account_type}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {tAccounts(`accountTypes.${type}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      className="shrink-0"
                      onClick={() => removeNewAccount(account.id)}
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
        </>
      )}

      <Button className="w-full" onClick={addNewAccount} variant="outline">
        <Plus className="mr-2 size-4" />
        {hasAccounts ? t("addAnother") : t("addAccount")}
      </Button>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="ghost">
          {t("back")}
        </Button>
        <Button disabled={loading || loadingExisting} onClick={handleSubmit}>
          {loading ? t("creating") : t("continue")}
        </Button>
      </div>
    </div>
  );
}
