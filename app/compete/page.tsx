"use client";

import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
	type CategoryItem,
	type SubCategory,
	useCategoryMap,
} from "~/hooks/useCategories";
import { useEnv } from "~/hooks/useEnv";
import CompetitionCategoryCard from "./components/CompetitionCategoryCard";
import CompetitionModuleSection from "./components/CompetitionModuleSection";

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

		return result;
	}, [categoryItem, categories.get]);

	if (!categoryItem) {
		return <h1 className="text-3xl">Category {category} not found</h1>;
	}
	return (
		<div className="mx-auto max-w-screen-xl space-y-4 px-10">
			<Breadcrumbs>
				{breadcrumbItems.map((item) => (
					<BreadcrumbItem key={item.url} href={`/compete?category=${item.url}`}>
						{item.title}
					</BreadcrumbItem>
				))}
			</Breadcrumbs>
			<h1 className="pt-4 pb-8 text-center text-5xl">
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
				<div>
					<Tabs aria-label="Competition Modules" disabledKeys={["tournaments"]}>
						<Tab key="wagers" title="Wagers">
							<CompetitionModuleSection
								category={categoryItem}
								path="wager"
								module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
							/>
						</Tab>
						<Tab key="leagues" title="Leagues">
							<CompetitionModuleSection
								category={categoryItem}
								path="league"
								module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
							/>
						</Tab>
						<Tab key="tournaments" title="Tournaments" />
					</Tabs>
				</div>
			)}
		</div>
	);
};

export default Compete;
