"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import { useSearchParams } from "next/navigation";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const ViewWager = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");

	if (!competitionId) {
		return <h1 className="text-5xl text-center">Wager id not provided...</h1>;
	}
	return (
		<div className="space-y-4">
			<h1 className="text-5xl text-center">View Wager</h1>
			{cosmWasmClient && (
				<ViewCompetition
					cosmWasmClient={cosmWasmClient}
					competitionId={competitionId}
					moduleAddr={env.ARENA_WAGER_MODULE_ADDRESS}
				/>
			)}
		</div>
	);
};

export default ViewWager;
