import { AppHeader } from "@/components/layout/app-header";
import { CategoryList } from "@/components/settings/category-list";
import { getCategories } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <AppHeader title="Categorías" />
      <div className="flex-1 p-6">
        <CategoryList categories={categories} />
      </div>
    </>
  );
}
