import { useQuery } from "@tanstack/react-query";
import dev_categories from "~/config/categories.development.json";
import prod_categories from "~/config/categories.production.json";
import { useEnv } from "./useEnv";

interface CategoryBase {
	url: string;
	title?: string;
	img?: string;
}

type Keys = "id" | "url";

export interface CategoryLeaf extends CategoryBase {
	category_id: number | null;
}

export interface SubCategory extends CategoryBase {
	children: CategoryItem[];
}

export type CategoryItem = CategoryLeaf | SubCategory;

function setData(
	categoryMap: Map<string, CategoryItem>,
	daoItem: CategoryItem,
	key: Keys,
) {
	if ("children" in daoItem) {
		for (const child of daoItem.children) {
			setData(categoryMap, child, key);
		}
	}

	if (key === "id" && "category_id" in daoItem)
		categoryMap.set(
			daoItem?.category_id ? daoItem.category_id.toString() : "",
			daoItem,
		);
	else categoryMap.set(daoItem.url, daoItem);
}

const getCategoryMap = (env: string, key: Keys) => {
	const categoryMap = new Map<string, CategoryItem>();
	if (env === "development") {
		const categoryData = dev_categories as SubCategory;

		setData(categoryMap, categoryData, key);
		return categoryMap;
	}
	if (env === "production") {
		const categoryData = prod_categories as SubCategory;

		setData(categoryMap, categoryData, key);
		return categoryMap;
	}
	throw Error(`Unknown env: ${env}`);
};

export const useCategoryMap = (key: Keys = "url") => {
	const { data: env } = useEnv();
	return useQuery(["categories", key], () => getCategoryMap(env.ENV, key), {
		initialData: getCategoryMap(env.ENV, key),
		staleTime: Number.POSITIVE_INFINITY,
	});
};
