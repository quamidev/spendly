"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAccount, updateAccount } from "@/lib/actions/accounts";
import type { Account, AccountType } from "@/lib/types";
import { ACCOUNT_TYPES } from "@/lib/types";

interface AccountFormProps {
  account?: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountForm({ account, open, onOpenChange }: AccountFormProps) {
  const t = useTranslations("Settings.accounts");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(account?.name ?? "");
  const [accountType, setAccountType] = useState<AccountType>(
    account?.account_type ?? "cash"
  );

  const isEditing = !!account;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setLoading(true);

    const data = {
      name: name.trim(),
      account_type: accountType,
    };

    if (isEditing) {
      const result = await updateAccount(account.id, data);
      setLoading(false);
      if (result.success) {
        toast.success(t("updated"));
        onOpenChange(false);
        setName("");
        setAccountType("cash");
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createAccount(data);
      setLoading(false);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(t("created"));
        onOpenChange(false);
        setName("");
        setAccountType("cash");
      }
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("editTitle") : t("title")}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? t("editDescription") : t("description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                required
                value={name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{t("type")}</Label>
              <Select
                onValueChange={(value) => setAccountType(value as AccountType)}
                value={accountType}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("typePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`accountTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {t("cancel")}
            </Button>
            <Button disabled={loading} type="submit">
              {loading && t("saving")}
              {!loading && isEditing && t("save")}
              {!(loading || isEditing) && t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
