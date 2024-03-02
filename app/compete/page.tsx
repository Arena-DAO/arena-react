"use client";

import { Button, ButtonGroup, Link } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { BsPlus } from "react-icons/bs";
import { SubCategory, useCategoryMap } from "~/hooks/useCategories";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import { WithClient } from "~/types/util";
import CompetitionCategoryCard from "./components/CompetitionCategoryCard";
import CompetitionModuleSection from "./components/CompetitionModuleSection";

const CompeteComponent = ({ cosmWasmClient }: WithClient<unknown>) => {
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
			<h1 className="text-5xl">
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
					<div className="block text-right">
						<ButtonGroup variant="ghost" className="gap-2">
							<Link href={`/wager/create?category=${category}`}>
								<Button startContent={<BsPlus />}>Create Wager</Button>
							</Link>
							<Link href={`/league/create?category=${category}`}>
								<Button startContent={<BsPlus />}>Create League</Button>
							</Link>
						</ButtonGroup>
					</div>
					<CompetitionModuleSection
						title="Wagers"
						cosmWasmClient={cosmWasmClient}
						module_addr={env.ARENA_WAGER_MODULE_ADDRESS}
						category={categoryItem}
						path="wager"
					/>
					<CompetitionModuleSection
						title="Leagues"
						cosmWasmClient={cosmWasmClient}
						category={categoryItem}
						module_addr={env.ARENA_LEAGUE_MODULE_ADDRESS}
						path="league"
					/>
				</>
			)}
		</div>
	);
};

export default function Compete() {
	const { data } = useCosmWasmClient();
	return <>{data && <CompeteComponent cosmWasmClient={data} />}</>;
}
