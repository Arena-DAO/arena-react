import { useMemo } from "react";
import { useCategoryMap } from "./useCategoryMap";

export function useCategory(identifier?: string | null) {
	const isNumber = Number.isInteger(Number(identifier));
	const { data: categoryMap } = isNumber
		? useCategoryMap("id")
		: useCategoryMap("url");

	return useMemo(() => {
		if (!identifier || !categoryMap) return undefined;

		const categoryItem = categoryMap.get(identifier);

		// Only return if it's a CategoryLeaf
		return categoryItem && "category_id" in categoryItem
			? categoryItem
			: undefined;
	}, [identifier, categoryMap]);
}
