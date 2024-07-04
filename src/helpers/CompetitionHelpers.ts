import { arenaLeagueModuleQueryKeys } from "~/codegen/ArenaLeagueModule.react-query";
import { arenaTournamentModuleQueryKeys } from "~/codegen/ArenaTournamentModule.react-query";
import { arenaWagerModuleQueryKeys } from "~/codegen/ArenaWagerModule.react-query";
import type { Expiration } from "~/codegen/ArenaWagerModule.types";
import type { Env } from "~/hooks/useEnv";
import type { CompetitionType } from "~/types/CompetitionType";
import { formatTimestampToDisplay } from "./DateHelpers";

export const getCompetitionQueryKey = (
	env: Env,
	competitionType: CompetitionType,
	competitionId: string,
) => {
	switch (competitionType) {
		case "wager":
			return arenaWagerModuleQueryKeys.competition(
				env.ARENA_WAGER_MODULE_ADDRESS,
				{
					competitionId,
				},
			);
		case "league":
			return arenaLeagueModuleQueryKeys.competition(
				env.ARENA_LEAGUE_MODULE_ADDRESS,
				{
					competitionId,
				},
			);
		case "tournament":
			return arenaTournamentModuleQueryKeys.competition(
				env.ARENA_TOURNAMENT_MODULE_ADDRESS,
				{
					competitionId,
				},
			);
		default:
			throw new Error("Invalid competition type");
	}
};

export const formatExpiration = (expiration: Expiration): string => {
	if ("at_height" in expiration) return `At height: ${expiration.at_height}`;
	if ("at_time" in expiration)
		return formatTimestampToDisplay(expiration.at_time);
	return "Never";
};
