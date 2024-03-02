import { useQuery } from "@tanstack/react-query";
import dev_categories from "~/config/categories.development.json";
import prod_categories from "~/config/categories.production.json";
import { useEnv } from "./useEnv";

interface CategoryBase {
	url: string;
	title?: string;
	img?: string;
}

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
) {
	if ("children" in daoItem) {
		for (const child of daoItem.children) {
			setData(categoryMap, child);
		}
	}
	categoryMap.set(daoItem.url, daoItem);
}

const getCategoryMap = (env: string) => {
	const categoryMap = new Map<string, CategoryItem>();
	categoryMap.set("other", {
		url: "other",
		title: "Other",
		category_id: null,
		img: "/default_trophy.jpg",
	});
	if (env === "development") {
		const categoryData = dev_categories as SubCategory;

		setData(categoryMap, categoryData);
		return categoryMap;
	}
	if (env === "production") {
		const categoryData = prod_categories as SubCategory;

		setData(categoryMap, categoryData);
		return categoryMap;
	}
	throw Error(`Unknown env: ${env}`);
};

export const useCategoryMap = () => {
	const { data: env } = useEnv();
	return useQuery(["categories"], () => getCategoryMap(env.ENV), {
		initialData: getCategoryMap(env.ENV),
	});
};
