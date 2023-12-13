import { CategoryItem } from '@config/categories';
import { createContext, useContext } from 'react';

export const CategoriesContext = createContext(new Map<string, CategoryItem>());

export const useCategoriesContext = () => useContext(CategoriesContext);
