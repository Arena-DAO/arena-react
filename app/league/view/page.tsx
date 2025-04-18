"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import { useChain } from "@cosmos-kit/react";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Input,
	Spinner,
	Tab,
	Tabs,
} from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { useArenaLeagueModuleCompetitionQuery } from "~/codegen/ArenaLeagueModule.react-query";
import { CategoryProvider } from "~/contexts/CategoryContext";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import LeaderboardDisplay from "./components/LeaderboardDisplay";
import RoundsDisplay from "./components/RoundsDisplay";
import { Share2 } from "lucide-react";
import DistributionDisplay from "@/components/competition/view/components/DistributionDisplay";

const ViewLeague = () => {
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
									<CardHeader>
										<div className="flex items-center gap-2">
											<Share2 className="text-primary-500" />
											<h3 className="font-semibold text-xl">Distribution</h3>
										</div>
									</CardHeader>
									<CardBody className="space-y-4">
										<p>
											How the league's funds will be distributed after all
											matches are processed.
										</p>
										<DistributionDisplay
											distribution={data.extension.distribution}
										/>
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

export default ViewLeague;
