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
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

interface CategoryFormProps {
  category?: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryForm({
  category,
  open,
  onOpenChange,
}: CategoryFormProps) {
  const t = useTranslations("Settings.categories");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [keywords, setKeywords] = useState(
    category?.keywords?.join(", ") ?? ""
  );

  const isEditing = !!category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    setLoading(true);

    const keywordsArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const data = {
      name: name.trim(),
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
    };

    if (isEditing) {
      const result = await updateCategory(category.id, data);
      setLoading(false);
      if (result.success) {
        toast.success(t("updated"));
        onOpenChange(false);
        setName("");
        setKeywords("");
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createCategory(data);
      setLoading(false);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(t("created"));
        onOpenChange(false);
        setName("");
        setKeywords("");
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
              <Label htmlFor="keywords">
                {t("keywords")}{" "}
                <span className="text-muted-foreground">
                  {t("keywordsOptional")}
                </span>
              </Label>
              <Input
                id="keywords"
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={t("keywordsPlaceholder")}
                value={keywords}
              />
              <p className="text-muted-foreground text-xs">
                {t("keywordsHelp")}
              </p>
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
