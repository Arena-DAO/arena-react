// contexts/CategoryContext.tsx
import type React from "react";
import { type ReactNode, createContext, useContext } from "react";
import { useCategory } from "../hooks/useCategory";
import type { CategoryLeaf } from "../hooks/useCategoryMap";

const CategoryContext = createContext<string | null | undefined>(undefined);

export const CategoryProvider: React.FC<{
	children: ReactNode;
	value?: string | null;
}> = ({ children, value }) => (
	<CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
);

export const useCategoryContext = (
	initialValue?: string | null,
): CategoryLeaf | undefined => {
	const contextValue = useContext(CategoryContext);
	const identifier = contextValue ?? initialValue;
	return useCategory(identifier);
};
