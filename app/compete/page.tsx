"use client";

import { Tab, Tabs } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { SubCategory, useCategoryMap } from "~/hooks/useCategories";
import { useEnv } from "~/hooks/useEnv";
import CompetitionCategoryCard from "./components/CompetitionCategoryCard";
import CompetitionModuleSection from "./components/CompetitionModuleSection";

const Compete = () => {
	const searchParams = useSearchParams();
	const { data: categories } = useCategoryMap();
	const { data: env } = useEnv();

	const category = searchParams?.get("category") ?? "";
	const categoryItem = categories.get(category);

	if (!categoryItem) {
		return <h1 className="text-3xl">Category {category} not found</h1>;
	}
	return (
		<div className="space-y-4">
			<h1 className="text-5xl text-center">
				{categoryItem.title} {"children" in categoryItem && "Categories"}
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
					<Tabs
						aria-label="Competition Modules"
						disabledKeys={["leagues", "tournaments"]}
					>
						<Tab key="wagers" title="Wagers">
							<CompetitionModuleSection
								category={categoryItem}
								path="wager"
								module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
							/>
						</Tab>
						<Tab key="leagues" title="Leagues" />
						<Tab key="tournaments" title="Tournaments" />
					</Tabs>
				</>
			)}
		</div>
	);
};

export default Compete;
