"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Input,
	Progress,
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
import { useState } from "react";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { useArenaLeagueModuleCompetitionQuery } from "~/codegen/ArenaLeagueModule.react-query";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import LeaderboardDisplay from "./components/LeaderboardDisplay";
import RoundsDisplay from "./components/RoundsDisplay";

const ViewWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");
	const [version, setVersion] = useState(0);
	const [status, setStatus] = useState<CompetitionStatus>("pending");

	const { data } = useArenaLeagueModuleCompetitionQuery({
		client: new ArenaLeagueModuleQueryClient(
			// biome-ignore lint/style/noNonNullAssertion: Checked by enabled option
			cosmWasmClient!,
			env.ARENA_LEAGUE_MODULE_ADDRESS,
		),
		args: {
			// biome-ignore lint/style/noNonNullAssertion: Checked by enabled option
			competitionId: competitionId!,
		},
		options: {
			enabled: !!cosmWasmClient && !!competitionId,
			onSuccess: (data) => setStatus(data.status),
		},
	});

	if (!competitionId) {
		return (
			<h1 className="title text-center text-5xl">League id not provided...</h1>
		);
	}
	return (
		<div className="mx-auto w-full max-w-screen-xl justify-center space-y-4 px-10">
			<h1 className="title text-center text-5xl">View League</h1>
			{data && cosmWasmClient && (
				<ViewCompetition
					cosmWasmClient={cosmWasmClient}
					competition={data}
					moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
					hideProcess
					status={status}
					setStatus={setStatus}
				>
					<Tabs aria-label="League Info" color="primary">
						<Tab
							key="leaderboard"
							title="Leaderboard"
							className="text-xs md:text-lg"
						>
							<LeaderboardDisplay
								cosmWasmClient={cosmWasmClient}
								moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
								league={data}
								version={version}
							/>
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
										How the league's funds will be distributed after all matches
										are processed.
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
								cosmWasmClient={cosmWasmClient}
								moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
								league={data}
								version={version}
								setVersion={setVersion}
								setStatus={setStatus}
							/>
						</Tab>
					</Tabs>
				</ViewCompetition>
			)}
		</div>
	);
};

export default ViewWager;
