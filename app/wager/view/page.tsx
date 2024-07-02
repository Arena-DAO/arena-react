"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
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

	const { data } = useArenaWagerModuleCompetitionQuery({
		client:
			cosmWasmClient &&
			new ArenaWagerModuleQueryClient(
				cosmWasmClient,
				env.ARENA_WAGER_MODULE_ADDRESS,
			),
		args: {
			// biome-ignore lint/style/noNonNullAssertion: Checked by enabled option
			competitionId: competitionId!,
		},
		options: {
			enabled: !!competitionId,
		},
	});

	if (!competitionId) {
		return (
			<h1 className="title text-center text-5xl">Wager id not provided...</h1>
		);
	}
	return (
		<div className="mx-auto w-full max-w-screen-xl justify-center space-y-4 px-10">
			<h1 className="title text-center text-5xl">View Wager</h1>
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
