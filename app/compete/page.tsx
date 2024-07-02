"use client";

import { BreadcrumbItem, Breadcrumbs, Button, Link } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BsPlus } from "react-icons/bs";
import {
	type CategoryItem,
	type SubCategory,
	useCategoryMap,
} from "~/hooks/useCategories";
import { useEnv } from "~/hooks/useEnv";
import CompetitionCategoryCard from "./components/CompetitionCategoryCard";
import CompetitionEnrollmentItems from "./components/CompetitionEnrollmentItems";

const Compete = () => {
	const searchParams = useSearchParams();
	const { data: categories } = useCategoryMap();
	const { data: env } = useEnv();

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
		<div className="mx-auto max-w-screen-xl space-y-4 p-4">
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
			<h1 className="text-center text-5xl">
				{categoryItem.title}{" "}
				{"children" in categoryItem ? "Categories" : "Competitions"}
			</h1>
			{"children" in categoryItem && (
				<div className="grid grid-cols-12 gap-4">
					{categoryItem.children.map((x) => {
						return (
							<CompetitionCategoryCard
								category={x as SubCategory}
								key={x.url}
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
						>
							Create
						</Button>
					</div>
					<CompetitionEnrollmentItems category={categoryItem} />
				</>
			)}
		</div>
	);
};

export default Compete;
