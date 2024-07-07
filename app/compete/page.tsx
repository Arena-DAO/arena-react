"use client";

import { BreadcrumbItem, Breadcrumbs, Button, Link } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BsPlus } from "react-icons/bs";
import { CategoryProvider } from "~/contexts/CategoryContext";
import {
	type CategoryItem,
	type SubCategory,
	useCategoryMap,
} from "~/hooks/useCategoryMap";
import CompetitionCategoryCard from "./components/CompetitionCategoryCard";
import CompetitionEnrollmentItems from "./components/CompetitionEnrollmentItems";

const Compete = () => {
	const searchParams = useSearchParams();
	const { data: categories } = useCategoryMap();

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);

	const breadcrumbItems: CategoryItem[] = useMemo(() => {
		if (!categoryItem) return [];

		const result = [];
		let currentItem: CategoryItem | undefined = categoryItem;

		while (currentItem) {
			result.unshift(currentItem);

			currentItem = currentItem.parent_url
				? categories.get(currentItem.parent_url)
				: undefined;
		}

		result.unshift({ title: "Categories", url: "", children: [], img: "" });

		return result;
	}, [categoryItem, categories.get]);

	if (!categoryItem) {
		return <h1 className="text-3xl">Category {category} not found</h1>;
	}
	return (
		<div className="container mx-auto space-y-4 p-4">
			<Breadcrumbs>
				{breadcrumbItems.map((item) => (
					<BreadcrumbItem
						key={item.title}
						href={item.url ? `/compete?category=${item.url}` : "/compete"}
					>
						{item.title}
					</BreadcrumbItem>
				))}
			</Breadcrumbs>
			<h1 className="pb-6 text-center text-5xl">
				{categoryItem.title}{" "}
				{"children" in categoryItem ? "Categories" : "Competitions"}
			</h1>
			{"children" in categoryItem && (
				<div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{categoryItem.children.map((x) => {
						return (
							<CompetitionCategoryCard
								category={x as SubCategory}
								key={x.url}
								className="w-full"
							/>
						);
					})}
				</div>
			)}
			{"category_id" in categoryItem && (
				<>
					<div className="flex justify-end">
						<Button
							startContent={<BsPlus />}
							as={Link}
							href={`/compete/create?category=${category}`}
							color="primary"
						>
							Create
						</Button>
					</div>
					<CategoryProvider value={categoryItem.url}>
						<CompetitionEnrollmentItems category={categoryItem} />
					</CategoryProvider>
				</>
			)}
		</div>
	);
};

export default Compete;
