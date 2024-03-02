"use client";

import {
	Badge,
	Button,
	Card,
	CardBody,
	CardHeader,
	Link,
	Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { contracts } from "~/codegen";
import { statusColors } from "~/helpers/ArenaHelpers";
import { CategoryLeaf } from "~/hooks/useCategories";
import { useEnv } from "~/hooks/useEnv";
import { WithClient } from "~/types/util";

interface CompetitionModuleSectionProps {
	category: CategoryLeaf;
	module_addr: string;
	path: string;
}

interface CompetitionModuleSectionItemsProps
	extends CompetitionModuleSectionProps {
	startAfter?: string;
	setLastCompetitionId: (id: string) => void;
	setIsEmptyData: Dispatch<SetStateAction<boolean>>;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const CompetitionModuleSectionItems = ({
	cosmWasmClient,
	category,
	module_addr,
	startAfter,
	path,
	setLastCompetitionId,
	setIsEmptyData,
	setIsLoading,
}: WithClient<CompetitionModuleSectionItemsProps>) => {
	const router = useRouter();
	const { ArenaWagerModule } = contracts;
	const { data, isLoading } =
		ArenaWagerModule.useArenaWagerModuleCompetitionsQuery({
			client: new ArenaWagerModule.ArenaWagerModuleQueryClient(
				cosmWasmClient,
				module_addr,
			),
			args: {
				filter: { category: { id: category.category_id?.toString() } },
				startAfter: startAfter,
			},
		});
	const { data: env } = useEnv();

	// biome-ignore lint/correctness/useExhaustiveDependencies: Seems to be a false positive
	useEffect(() => {
		if (data && "length" in data) {
			if (data.length > 0) {
				const lastCompetition = data[data.length - 1];
				if (lastCompetition) {
					setLastCompetitionId(lastCompetition.id);
				}
			}
			setIsEmptyData(data.length < env.PAGINATION_LIMIT);
			setIsLoading(false);
		}
	}, [
		data,
		setLastCompetitionId,
		setIsEmptyData,
		setIsLoading,
		env.PAGINATION_LIMIT,
	]);

	if (isLoading) {
		return <Spinner />;
	}
	if (!data || data.length === 0) {
		return null;
	}
	return (
		<>
			{data?.map((competition) => (
				<Card
					key={competition.id}
					isPressable
					onPress={() =>
						router.push(
							`/${path}/view?category=${category}&id=${competition.id}`,
						)
					}
				>
					<CardHeader>
						<Badge
							content={competition.status}
							color={statusColors[competition.status]}
						>
							<h1 className="text-2xl">{competition.name}</h1>
						</Badge>
					</CardHeader>
					<CardBody>
						<p>{competition.description}</p>
					</CardBody>
				</Card>
			))}
		</>
	);
};

const CompetitionModuleSection = ({
	cosmWasmClient,
	category,
	module_addr,
	title,
	path,
}: WithClient<CompetitionModuleSectionProps> & { title: string }) => {
	const [isEmptyData, setIsEmptyData] = useState(true);
	const [pages, setPages] = useState<[string | undefined]>([undefined]);
	const [lastCompetitionId, setLastCompetitionId] = useState<
		string | undefined
	>();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	return (
		<>
			<div className="block text-start">
				<Link href={`#${title}`}>
					<h2 id={title} className="text-3xl font-semibold text-foreground">
						<span className="text-primary">#</span> {title}
					</h2>
				</Link>
			</div>
			<div className="grid grid-cols-12 gap-4">
				{pages.map((page) => (
					<CompetitionModuleSectionItems
						key={page ?? "null"}
						cosmWasmClient={cosmWasmClient}
						category={category}
						startAfter={page}
						module_addr={module_addr}
						path={path}
						setIsEmptyData={setIsEmptyData}
						setIsLoading={setIsLoading}
						setLastCompetitionId={setLastCompetitionId}
					/>
				))}
			</div>
			{pages.length === 1 && lastCompetitionId === undefined && (
				<div className="block my-4">
					<em>No competitions yet...</em>
				</div>
			)}
			{!isEmptyData && (
				<Button
					aria-label="Load more"
					variant="ghost"
					isLoading={isLoading}
					onClick={() => {
						if (lastCompetitionId) {
							setIsLoading(true);
							setPages((x) => {
								x.push(lastCompetitionId);
								return x;
							});
						}
					}}
				>
					Load More...
				</Button>
			)}
		</>
	);
};

export default CompetitionModuleSection;
