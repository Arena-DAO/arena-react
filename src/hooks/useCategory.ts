import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {} from "~/helpers/TokenHelpers";
import { type CategoryItem, useCategoryMap } from "./useCategories";

function getCategory(
	categories: Map<string, CategoryItem>,
	categoryParam: string | null,
) {
	if (categoryParam) {
		const categoryItem = categories.get(categoryParam);

		if (categoryItem && "category_id" in categoryItem) return categoryItem;
	}

	return null;
}

export const useCategory = () => {
	const searchParams = useSearchParams();
	const categoryParam = searchParams.get("category");
	const { data: categories } = useCategoryMap();

	return useQuery(
		["category", categoryParam],
		() => getCategory(categories, categoryParam),
		{
			enabled: !!categoryParam,
			initialData: getCategory(categories, categoryParam),
			staleTime: Number.POSITIVE_INFINITY,
		},
	);
};
