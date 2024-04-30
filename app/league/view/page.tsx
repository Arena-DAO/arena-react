"use client";

import ViewCompetition from "@/components/competition/view/ViewCompetition";
import { useSearchParams } from "next/navigation";
import { useCosmWasmClient } from "~/hooks/useCosmWamClient";
import { useEnv } from "~/hooks/useEnv";

const ViewLeague = () => {
	const { data: env } = useEnv();
	const { data: cosmWasmClient } = useCosmWasmClient();
	const searchParams = useSearchParams();
	const competitionId = searchParams?.get("competitionId");

	if (!competitionId) {
		return <h1 className="text-center text-5xl">League id not provided...</h1>;
	}
	return (
		<div className="space-y-4">
			<h1 className="text-center text-5xl">View League</h1>
			{cosmWasmClient && (
				<ViewCompetition
					cosmWasmClient={cosmWasmClient}
					competitionId={competitionId}
					moduleAddr={env.ARENA_LEAGUE_MODULE_ADDRESS}
				/>
			)}
		</div>
	);
};

export default ViewLeague;
