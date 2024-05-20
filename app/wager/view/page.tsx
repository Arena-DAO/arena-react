"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArenaWagerModuleQueryClient } from "~/codegen/ArenaWagerModule.client";
import { useArenaWagerModuleCompetitionQuery } from "~/codegen/ArenaWagerModule.react-query";
import type { CompetitionStatus } from "~/codegen/ArenaWagerModule.types";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const ViewWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");
	const [status, setStatus] = useState<CompetitionStatus>("pending");

	const { data } = useArenaWagerModuleCompetitionQuery({
		client: new ArenaWagerModuleQueryClient(
			// biome-ignore lint/style/noNonNullAssertion: Checked by enabled option
			cosmWasmClient!,
			env.ARENA_WAGER_MODULE_ADDRESS,
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
			<h1 className="title text-center text-5xl">Wager id not provided...</h1>
		);
	}
	return (
		<div className="space-y-4">
			<h1 className="title text-center text-5xl">View Wager</h1>
			{data && cosmWasmClient && (
				<ViewCompetition
					cosmWasmClient={cosmWasmClient}
					competition={data}
					moduleAddr={env.ARENA_WAGER_MODULE_ADDRESS}
					status={status}
					setStatus={setStatus}
				/>
			)}
		</div>
	);
};

export default ViewWager;
