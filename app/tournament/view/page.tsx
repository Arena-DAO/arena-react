"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import DistributionDisplay from "@/components/competition/view/components/DistributionDisplay";
import { useChain } from "@cosmos-kit/react-lite";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Input,
	Spinner,
	Switch,
	Tab,
	Tabs,
} from "@heroui/react";
import { Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ReactFlowProvider } from "reactflow";
import { ArenaTournamentModuleQueryClient } from "~/codegen/ArenaTournamentModule.client";
import { useArenaTournamentModuleCompetitionQuery } from "~/codegen/ArenaTournamentModule.react-query";
import { CategoryProvider } from "~/contexts/CategoryContext";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import Bracket from "./components/Bracket";

const ViewWager = () => {
	const env = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const { address } = useChain(env.CHAIN);
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");
	const showBracket = searchParams?.get("showBracket") === "true";

	const { data, isLoading } = useArenaTournamentModuleCompetitionQuery({
		client:
			cosmWasmClient &&
			new ArenaTournamentModuleQueryClient(
				cosmWasmClient,
				env.ARENA_TOURNAMENT_MODULE_ADDRESS,
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
			<h1 className="title text-center text-5xl">
				Tournament id not provided...
			</h1>
		);
	}
	if (isLoading) {
		return (
			<div className="flex justify-center">
				<Spinner label="Loading tournament..." />
			</div>
		);
	}

	return (
		<CategoryProvider value={data?.category_id}>
			<div className="container mx-auto space-y-4">
				{data && (
					<ViewCompetition
						competition={data}
						moduleAddr={env.ARENA_TOURNAMENT_MODULE_ADDRESS}
						hideProcess={address !== env.ARENA_DAO_ADDRESS}
						competitionType="tournament"
					>
						<Tabs aria-label="Tournament Info" color="primary">
							<Tab key="bracket" title="Bracket" className="text-xs md:text-lg">
								<div className="h-[85vh] w-full">
									<ReactFlowProvider>
										<Bracket
											tournamentId={data.id}
											escrow={data.escrow}
											isHost={
												address === data.host ||
												address === env.ARENA_DAO_ADDRESS
											}
											showBracket={showBracket}
										/>
									</ReactFlowProvider>
								</div>
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
											How the tournament's funds will be distributed after all
											matches are processed.
										</p>
										<DistributionDisplay
											distribution={data.extension.distribution}
										/>
									</CardBody>
									<CardFooter className="grid grid-cols-12 gap-4">
										<Input
											label="Elimination Type"
											className="col-span-12 md:col-span-8"
											value={
												data.extension.elimination_type === "double_elimination"
													? "Double Elimination"
													: "Single Elimination"
											}
											readOnly
										/>
										{typeof data.extension.elimination_type === "object" &&
											"single_elimination" in
												data.extension.elimination_type && (
												<Switch
													className="col-span-12 md:col-span-4"
													aria-label="Play 3rd place match"
													isDisabled
													isSelected={
														data.extension.elimination_type.single_elimination
															.play_third_place_match
													}
												>
													Play 3rd Place Match
												</Switch>
											)}
									</CardFooter>
								</Card>
							</Tab>
						</Tabs>
					</ViewCompetition>
				)}
			</div>
		</CategoryProvider>
	);
};

export default ViewWager;
