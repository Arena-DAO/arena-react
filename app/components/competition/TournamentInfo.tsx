import { Progress } from "@heroui/react";
import type React from "react";
import type { CompetitionResponseForTournamentExt } from "~/codegen/ArenaTournamentModule.types";

interface TournamentInfoProps {
	tournament: CompetitionResponseForTournamentExt;
}

const TournamentInfo: React.FC<TournamentInfoProps> = ({ tournament }) => {
	const progress =
		(Number(tournament.extension.processed_matches) /
			Number(tournament.extension.total_matches)) *
		100;

	return (
		<div className="flex flex-col gap-2">
			<div className="text-sm">
				<span className="font-semibold">Elimination Type:</span>{" "}
				{tournament.extension.elimination_type === "double_elimination"
					? "Double Elimination"
					: "Single Elimination"}
			</div>

			{typeof tournament.extension.elimination_type === "object" &&
				"single_elimination" in tournament.extension.elimination_type && (
					<div className="text-sm">
						<span className="font-semibold">Play Third Place Match:</span>{" "}
						{tournament.extension.elimination_type.single_elimination
							.play_third_place_match
							? "Yes"
							: "No"}
					</div>
				)}

			<div className="text-sm">
				<span className="font-semibold">Matches:</span>{" "}
				{tournament.extension.processed_matches}/
				{tournament.extension.total_matches}
			</div>

			<Progress
				label="Tournament Progress"
				value={progress}
				className="max-w-md"
				showValueLabel={true}
			/>
		</div>
	);
};

export default TournamentInfo;
