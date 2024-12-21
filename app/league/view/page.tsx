"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import { useChain } from "@cosmos-kit/react";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Input,
	Progress,
	Spinner,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
	Tabs,
} from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { useArenaLeagueModuleCompetitionQuery } from "~/codegen/ArenaLeagueModule.react-query";
import { CategoryProvider } from "~/contexts/CategoryContext";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import LeaderboardDisplay from "./components/LeaderboardDisplay";
import RoundsDisplay from "./components/RoundsDisplay";

const ViewWager = () => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { address } = useChain(env.CHAIN);
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");

	const { data, isLoading } = useArenaLeagueModuleCompetitionQuery({
		client:
			cosmWasmClient &&
			new ArenaLeagueModuleQueryClient(
				cosmWasmClient,
				env.ARENA_LEAGUE_MODULE_ADDRESS,
			),
		args: {
			competitionId: competitionId || "",
		},
		options: {
			enabled: !!competitionId && !!cosmWasmClient,
		},
	});

	if (!competitionId) {
		return (
			<h1 className="title text-center text-5xl">League id not provided...</h1>
		);
	}
	if (isLoading) {
		return (
			<div className="flex justify-center">
				<Spinner label="Loading league..." />
			</div>
		);
	}
	return (
		<CategoryProvider value={data?.category_id}>
			<div className="container mx-auto space-y-4">
				{data && (
					<ViewCompetition
						competition={data}
						moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
						hideProcess={address !== env.ARENA_DAO_ADDRESS}
						competitionType="league"
					>
						<Tabs aria-label="League Info" color="primary">
							<Tab
								key="leaderboard"
								title="Leaderboard"
								className="text-xs md:text-lg"
							>
								<LeaderboardDisplay league={data} />
							</Tab>
							<Tab
								key="basic"
								title="Configuration"
								className="text-xs md:text-lg"
							>
								<Card>
									<CardHeader>Final Distribution</CardHeader>
									<CardBody className="space-y-4">
										<p>
											How the league's funds will be distributed after all
											matches are processed.
										</p>
										<Table aria-label="Distribution" removeWrapper>
											<TableHeader>
												<TableColumn>Place</TableColumn>
												<TableColumn>Percentage</TableColumn>
											</TableHeader>
											<TableBody>
												{data.extension.distribution.map((percentage, i) => (
													// biome-ignore lint/suspicious/noArrayIndexKey: Best choice
													<TableRow key={i}>
														<TableCell>
															{getNumberWithOrdinal(i + 1)} place
														</TableCell>
														<TableCell>
															<Progress
																aria-label="Percentage"
																value={Number.parseFloat(percentage) * 100}
																color="primary"
																showValueLabel
															/>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardBody>
									<CardFooter className="grid grid-cols-12 gap-4">
										<Input
											className="col-span-12 md:col-span-4"
											type="number"
											label="Points Per Win"
											readOnly
											value={data.extension.match_win_points}
										/>
										<Input
											className="col-span-12 md:col-span-4"
											type="number"
											label="Points Per Draw"
											readOnly
											value={data.extension.match_draw_points}
										/>
										<Input
											className="col-span-12 md:col-span-4"
											type="number"
											label="Points Per Loss"
											readOnly
											value={data.extension.match_lose_points}
										/>
									</CardFooter>
								</Card>
							</Tab>
							<Tab key="rounds" title="Rounds" className="text-xs md:text-lg">
								<RoundsDisplay
									moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
									league={data}
								/>
							</Tab>
						</Tabs>
					</ViewCompetition>
				)}
			</div>
		</CategoryProvider>
	);
};

export default ViewWager;
