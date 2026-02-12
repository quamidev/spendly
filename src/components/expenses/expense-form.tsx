"use client";

import { CalendarIcon, Loader2, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AiVoiceExpenseInput } from "@/components/expenses/ai-voice-expense-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAccount } from "@/lib/actions/accounts";
import { createCategory } from "@/lib/actions/categories";
import { createExpense, updateExpense } from "@/lib/actions/expenses";
import { createOwner } from "@/lib/actions/owners";
import type {
  Account,
  Category,
  ClassifyExpenseResult,
  ExpenseSource,
  ExpenseWithRelations,
  Owner,
} from "@/lib/types";
import { DEFAULT_CURRENCY, OWNER_COLOR_PRESETS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ExpenseFormProps {
  categories: Category[];
  accounts: Account[];
  owners: Owner[];
  expense?: ExpenseWithRelations | null;
}

function SuggestionAlert({
  message,
  onAction,
  actionLabel,
}: {
  message: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <Alert>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <Button onClick={onAction} size="sm" variant="outline">
          <Plus className="mr-1 h-3 w-3" />
          {actionLabel}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function ExpenseForm({
  categories: initialCategories,
  accounts: initialAccounts,
  owners: initialOwners,
  expense,
}: ExpenseFormProps) {
  const t = useTranslations("Expenses");
  const locale = useLocale();
  const router = useRouter();
  const isEditing = !!expense;

  const [categories, setCategories] = useState(initialCategories);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [owners, setOwners] = useState(initialOwners);

  const [date, setDate] = useState<Date>(
    expense ? new Date(`${expense.date}T12:00:00`) : new Date()
  );
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [currency, setCurrency] = useState(
    expense?.currency ?? DEFAULT_CURRENCY
  );
  const [description, setDescription] = useState(expense?.description ?? "");
  const [categoryId, setCategoryId] = useState(expense?.category_id ?? "");
  const [accountId, setAccountId] = useState(expense?.account_id ?? "");
  const [ownerId, setOwnerId] = useState(expense?.owner_id ?? "");
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [source, setSource] = useState<ExpenseSource>(
    expense?.source ?? "manual"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAi, setShowAi] = useState(!isEditing);
  const [aiSuggestion, setAiSuggestion] =
    useState<ClassifyExpenseResult | null>(null);

  const formatDateDisplay = (d: Date) =>
    new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);

  const handleAiClassified = useCallback(
    (result: ClassifyExpenseResult, classifySource: "ai_text" | "voice") => {
      setAiSuggestion(result);
      setSource(classifySource);

      if (result.amount !== null) {
        setAmount(result.amount.toString());
      }
      if (result.currency) {
        setCurrency(result.currency);
      }
      if (result.date) {
        setDate(new Date(`${result.date}T12:00:00`));
      }
      if (result.description) {
        setDescription(result.description);
      }
      if (result.suggestedCategoryId) {
        setCategoryId(result.suggestedCategoryId);
      }
      if (result.suggestedAccountId) {
        setAccountId(result.suggestedAccountId);
      }
      if (result.suggestedOwnerId) {
        setOwnerId(result.suggestedOwnerId);
      }

      toast.success(t("ai.classified"));
    },
    [t]
  );

  const handleCreateCategory = async (name: string) => {
    const result = await createCategory({ name, keywords: [] });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setCategories((prev) => [...prev, result]);
    setCategoryId(result.id);
    toast.success(t("ai.categoryCreated", { name }));
  };

  const handleCreateAccount = async (name: string) => {
    const result = await createAccount({
      name,
      account_type: "personal_bank",
    });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setAccounts((prev) => [...prev, result]);
    setAccountId(result.id);
    toast.success(t("ai.accountCreated", { name }));
  };

  const handleCreateOwner = async (name: string) => {
    const colorIndex = owners.length % OWNER_COLOR_PRESETS.length;
    const result = await createOwner({
      name,
      color_tag: OWNER_COLOR_PRESETS[colorIndex],
    });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setOwners((prev) => [...prev, result]);
    setOwnerId(result.id);
    toast.success(t("ai.ownerCreated", { name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(amount && description)) {
      toast.error(t("form.validationError"));
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const input = {
        date: dateStr,
        amount: Number.parseFloat(amount),
        currency,
        description,
        category_id: categoryId || null,
        account_id: accountId || null,
        owner_id: ownerId || null,
        notes: notes || null,
      };

      if (isEditing) {
        const result = await updateExpense(expense.id, input);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success(t("form.updated"));
      } else {
        const result = await createExpense(input, source);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success(t("form.created"));
      }

      router.push("/expenses");
    } catch {
      toast.error(t("form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* AI Input Section */}
      {showAi && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t("ai.title")}
            </CardTitle>
            <CardDescription>{t("ai.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AiVoiceExpenseInput
              accounts={accounts}
              categories={categories}
              onClassified={handleAiClassified}
              owners={owners}
            />
          </CardContent>
        </Card>
      )}

      {/* AI Suggestion Badges */}
      {aiSuggestion && (
        <div className="space-y-2">
          {aiSuggestion.newCategoryName && (
            <SuggestionAlert
              actionLabel={t("ai.create")}
              message={t("ai.suggestNewCategory", {
                name: aiSuggestion.newCategoryName,
              })}
              onAction={() =>
                handleCreateCategory(aiSuggestion.newCategoryName as string)
              }
            />
          )}
          {aiSuggestion.newAccountName && (
            <SuggestionAlert
              actionLabel={t("ai.create")}
              message={t("ai.suggestNewAccount", {
                name: aiSuggestion.newAccountName,
              })}
              onAction={() =>
                handleCreateAccount(aiSuggestion.newAccountName as string)
              }
            />
          )}
          {aiSuggestion.newOwnerName && (
            <SuggestionAlert
              actionLabel={t("ai.create")}
              message={t("ai.suggestNewOwner", {
                name: aiSuggestion.newOwnerName,
              })}
              onAction={() =>
                handleCreateOwner(aiSuggestion.newOwnerName as string)
              }
            />
          )}
        </div>
      )}

      {/* Manual Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isEditing ? t("form.editTitle") : t("form.title")}
            </CardTitle>
            {!isEditing && (
              <Button
                onClick={() => setShowAi(!showAi)}
                size="sm"
                variant="ghost"
              >
                <Sparkles className="mr-1 h-4 w-4" />
                {showAi ? t("ai.hide") : t("ai.show")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Date */}
            <div className="space-y-2">
              <Label>{t("form.date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    variant="outline"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateDisplay(date)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    defaultMonth={date}
                    mode="single"
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                      }
                    }}
                    selected={date}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>{t("form.amount")}</Label>
                <Input
                  min="0"
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                  value={amount}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("form.currency")}</Label>
                <Select onValueChange={setCurrency} value={currency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GTQ">GTQ</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{t("form.description")}</Label>
              <Input
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("form.descriptionPlaceholder")}
                value={description}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>{t("form.category")}</Label>
              <Select onValueChange={setCategoryId} value={categoryId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account */}
            <div className="space-y-2">
              <Label>{t("form.account")}</Label>
              <Select onValueChange={setAccountId} value={accountId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectAccount")} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Owner */}
            <div className="space-y-2">
              <Label>{t("form.owner")}</Label>
              <Select onValueChange={setOwnerId} value={ownerId}>
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectOwner")} />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((own) => (
                    <SelectItem key={own.id} value={own.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: own.color_tag }}
                        />
                        {own.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{t("form.notes")}</Label>
              <Textarea
                className="resize-none"
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("form.notesPlaceholder")}
                rows={2}
                value={notes}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" disabled={isSubmitting} type="submit">
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? t("form.save") : t("form.create")}
              </Button>
              <Button
                onClick={() => router.push("/expenses")}
                type="button"
                variant="outline"
              >
                {t("form.cancel")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
