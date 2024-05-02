"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import {
	Card,
	CardBody,
	CardHeader,
	Input,
	Progress,
	Table,
	TableBody,
	TableCell,
	TableColumn,
	TableHeader,
	TableRow,
} from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { ArenaLeagueModuleQueryClient } from "~/codegen/ArenaLeagueModule.client";
import { useArenaLeagueModuleCompetitionQuery } from "~/codegen/ArenaLeagueModule.react-query";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import LeaderboardDisplay from "./components/LeaderboardDisplay";

const ViewWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");

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
		},
	});

	if (!competitionId) {
		return <h1 className="text-center text-5xl">League id not provided...</h1>;
	}
	return (
		<div className="space-y-4">
			<h1 className="text-center text-5xl">View League</h1>
			{data && cosmWasmClient && (
				<ViewCompetition
					cosmWasmClient={cosmWasmClient}
					competition={data}
					moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
					hideProcess
				>
					<>
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
						</Card>
						<div className="grid grid-cols-12 gap-4">
							<Input
								className="col-span-12 md:col-span-4"
								type="number"
								label="Match Win Points"
								readOnly
								value={data.extension.match_win_points}
							/>
							<Input
								className="col-span-12 md:col-span-4"
								type="number"
								label="Match Draw Points"
								readOnly
								value={data.extension.match_draw_points}
							/>
							<Input
								className="col-span-12 md:col-span-4"
								type="number"
								label="Match Lose Points"
								readOnly
								value={data.extension.match_lose_points}
							/>
						</div>
					</>
					<div className="grid grid-cols-2 gap-4">
						<LeaderboardDisplay
							cosmWasmClient={cosmWasmClient}
							moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
							league={data}
							className="col-span-2 md:col-span-1"
						/>
					</div>
				</ViewCompetition>
			)}
		</div>
	);
};

export default ViewWager;
