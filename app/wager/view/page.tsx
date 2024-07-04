"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import { Spinner } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleCompetitionQuery } from "~/codegen/ArenaWagerModule.react-query";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const ViewWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");

	const { data, isLoading } = useArenaWagerModuleCompetitionQuery({
		client:
			cosmWasmClient &&
			new ArenaWagerModuleQueryClient(
				cosmWasmClient,
				env.ARENA_WAGER_MODULE_ADDRESS,
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
			<h1 className="title text-center text-5xl">Wager id not provided...</h1>
		);
	}
	if (isLoading) {
		return (
			<div className="flex justify-center">
				<Spinner label="Loading wager..." />
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-4">
			{data && (
				<ViewCompetition
					competition={data}
					moduleAddr={env.ARENA_WAGER_MODULE_ADDRESS}
					competitionType="wager"
				/>
			)}
		</div>
	);
};

export default ViewWager;
