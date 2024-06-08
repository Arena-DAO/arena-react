"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import {
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Input,
	Progress,
	Switch,
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
import { ReactFlowProvider } from "reactflow";
import { ArenaTournamentModuleQueryClient } from "~/codegen/ArenaTournamentModule.client";
import { useArenaTournamentModuleCompetitionQuery } from "~/codegen/ArenaTournamentModule.react-query";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";
import Bracket from "./components/Bracket";

const ViewWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");
	const [status, setStatus] = useState<CompetitionStatus>("pending");

	const { data } = useArenaTournamentModuleCompetitionQuery({
		client: new ArenaTournamentModuleQueryClient(
			// biome-ignore lint/style/noNonNullAssertion: Checked by enabled option
			cosmWasmClient!,
			env.ARENA_TOURNAMENT_MODULE_ADDRESS,
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
			<h1 className="title text-center text-5xl">
				Tournament id not provided...
			</h1>
		);
	}
	return (
		<div className="mx-auto w-full max-w-screen-xl justify-center space-y-4 px-10">
			<h1 className="title text-center text-5xl">View Tournament</h1>
			{data && cosmWasmClient && (
				<ViewCompetition
					cosmWasmClient={cosmWasmClient}
					competition={data}
					moduleAddr={env.ARENA_TOURNAMENT_MODULE_ADDRESS}
					hideProcess
					status={status}
					setStatus={setStatus}
				>
					<Tabs aria-label="Tournament Info" color="primary">
						<Tab key="bracket" title="Bracket" className="text-xs md:text-lg">
							<div className="h-96 w-full">
								<ReactFlowProvider>
									<Bracket
										tournament_id={competitionId}
										cosmWasmClient={cosmWasmClient}
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
								<CardHeader>Final Distribution</CardHeader>
								<CardBody className="space-y-4">
									<p>
										How the tournament's funds will be distributed after all
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
								<CardFooter>
									<Input
										label="Elimination Type"
										value={
											data.extension.elimination_type === "double_elimination"
												? "Double Elimination"
												: "Single Elimination"
										}
										readOnly
									/>
									{typeof data.extension.elimination_type === "object" &&
										"single_elimination" in data.extension.elimination_type && (
											<Switch
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
	);
};

export default ViewWager;
