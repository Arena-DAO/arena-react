"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import {
	Card,
	CardBody,
	CardHeader,
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
import { ArenaTournamentModuleQueryClient } from "~/codegen/ArenaTournamentModule.client";
import { useArenaTournamentModuleCompetitionQuery } from "~/codegen/ArenaTournamentModule.react-query";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import { getNumberWithOrdinal } from "~/helpers/UIHelpers";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const ViewWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");
	const [version, setVersion] = useState(0);
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
							<div />
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
										How the Tournament's funds will be distributed after all
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
							</Card>
						</Tab>
					</Tabs>
				</ViewCompetition>
			)}
		</div>
	);
};

export default ViewWager;
