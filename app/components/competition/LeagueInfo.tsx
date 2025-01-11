import { Progress } from "@nextui-org/react";
import type React from "react";
import type { CompetitionResponseForLeagueExt } from "~/codegen/ArenaLeagueModule.types";

interface LeagueInfoProps {
	league: CompetitionResponseForLeagueExt;
}

const LeagueInfo: React.FC<LeagueInfoProps> = ({ league }) => {
	const progress =
		(Number(league.extension.processed_matches) /
			Number(league.extension.matches)) *
		100;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between text-sm">
				<span>
					<span className="font-semibold">Teams:</span> {league.extension.teams}
				</span>
				<span>
					<span className="font-semibold">Matches:</span>{" "}
					{league.extension.processed_matches}/{league.extension.matches}
				</span>
			</div>

			<Progress
				label="Matches Progress"
				value={progress}
				className="max-w-md"
				showValueLabel={true}
			/>

			<div className="flex justify-between text-sm">
				<span>
					<span className="font-semibold">Win:</span>{" "}
					{league.extension.match_win_points}
				</span>
				<span>
					<span className="font-semibold">Draw:</span>{" "}
					{league.extension.match_draw_points}
				</span>
				<span>
					<span className="font-semibold">Lose:</span>{" "}
					{league.extension.match_lose_points}
				</span>
			</div>
		</div>
	);
};

export default LeagueInfo;
