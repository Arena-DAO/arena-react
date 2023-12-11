import env from './env';
import dev_categories from "./categories.development.json";
import prod_categories from "./categories.production.json";

interface BaseCategoryItem {
  url: string;
  title?: string;
  img?: string;
}

interface CategoryItemWithChildren extends BaseCategoryItem {
  children: CategoryItem[];
}

interface CategoryItemWithCategoryId extends BaseCategoryItem {
  category_id: string;
}

export type CategoryItem = CategoryItemWithChildren | CategoryItemWithCategoryId;


function populateItemToMap(
  daoItem: CategoryItem,
  daoMap: Map<string, CategoryItem> = new Map()
): Map<string, CategoryItem> {
  if ('children' in daoItem) {
    daoItem.children.forEach((child) => populateItemToMap(child, daoMap));
  }
  if (daoItem.url) daoMap.set(daoItem.url, daoItem);
  return daoMap;
}

export function getCategoryRoot(): CategoryItem {
  if(env.ENV == "development")
    return dev_categories as CategoryItem;
  if (env.ENV == "production")
    return prod_categories as CategoryItem;
  return { "url": "", category_id: "" }
}

export const CategoryMap = populateItemToMap(getCategoryRoot());

